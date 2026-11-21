import { createHash, randomBytes, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { dirname } from "node:path";
import type {
  MobileConnectApprovalRequest,
  MobileConnectApprovalRequestStatus,
  MobileConnectedDevice,
  MobileConnectHostBinding,
  MobileConnectLink,
  MobileConnectNetwork,
  MobileConnectTicket,
} from "@zollybot/contracts/mobile-connect";

const TICKET_TTL_MS = 300_000;
const APPROVAL_REQUEST_TTL_MS = 120_000;
const STORE_VERSION = 1;

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const a = parts[0];
  const b = parts[1];
  if (a === undefined || b === undefined) return false;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function privateAddresses(): string[] {
  const out: string[] = [];
  for (const iface of Object.values(networkInterfaces())) {
    for (const addr of iface ?? []) {
      if (addr.family === "IPv4" && !addr.internal && isPrivateIpv4(addr.address)) out.push(addr.address);
    }
  }
  return out;
}

function tailscaleAddresses(): string[] {
  return privateAddresses().filter((ip) => {
    const parts = ip.split(".").map(Number);
    const a = parts[0];
    const b = parts[1];
    return a === 100 && b !== undefined && b >= 64 && b <= 127;
  });
}

function resolveMobileConnectHostAddress(override?: string | null): string | null {
  if (override) {
    try {
      const u = new URL(override);
      if (u.protocol === "http:" || u.protocol === "https:") return u.host;
    } catch {
      // ignore
    }
  }
  const ips = [...tailscaleAddresses(), ...privateAddresses().filter((ip) => !tailscaleAddresses().includes(ip))];
  const seen = new Set<string>();
  for (const ip of ips) {
    if (seen.has(ip)) continue;
    seen.add(ip);
    return ip;
  }
  return null;
}

export interface MobileConnectSessionRecord {
  sessionId: string;
  hostId: string;
  fingerprint: string;
  deviceName: string;
  platform: MobileConnectedDevice["platform"];
  via: "code" | "link";
  tokenHash: string;
  connectedAt: number;
  lastActiveAt: number;
  revoked: boolean;
}

interface StoredState {
  version: number;
  host: MobileConnectHostBinding | null;
  originOverride: string | null;
  link: { token: string; createdAt: number; host: MobileConnectHostBinding; revoked: boolean } | null;
  devices: MobileConnectSessionRecord[];
}

function sameHost(a: MobileConnectHostBinding | null, b: MobileConnectHostBinding | null): boolean {
  if (!a || !b) return a === b;
  return a.hostId === b.hostId && a.fingerprint === b.fingerprint;
}

function isHostBinding(value: unknown): value is MobileConnectHostBinding {
  if (typeof value !== "object" || value === null) return false;
  if (!("hostId" in value) || !("fingerprint" in value)) return false;
  return typeof value.hostId === "string" && typeof value.fingerprint === "string";
}

function isStoredLink(
  value: unknown,
): value is { token: string; createdAt: number; host: MobileConnectHostBinding; revoked: boolean } {
  if (typeof value !== "object" || value === null) return false;
  if (!("token" in value) || !("createdAt" in value) || !("revoked" in value) || !("host" in value)) return false;
  return (
    typeof value.token === "string" &&
    typeof value.createdAt === "number" &&
    typeof value.revoked === "boolean" &&
    isHostBinding(value.host)
  );
}

function isPlatform(value: unknown): value is MobileConnectedDevice["platform"] {
  return value === "ios" || value === "android" || value === "unknown";
}

function isVia(value: unknown): value is "code" | "link" {
  return value === "code" || value === "link";
}

function isSessionRecord(value: unknown): value is MobileConnectSessionRecord {
  if (typeof value !== "object" || value === null) return false;
  if (!("sessionId" in value) || typeof value.sessionId !== "string") return false;
  if (!("hostId" in value) || typeof value.hostId !== "string") return false;
  if (!("fingerprint" in value) || typeof value.fingerprint !== "string") return false;
  if (!("deviceName" in value) || typeof value.deviceName !== "string") return false;
  if (!("platform" in value) || !isPlatform(value.platform)) return false;
  if (!("via" in value) || !isVia(value.via)) return false;
  if (!("tokenHash" in value) || typeof value.tokenHash !== "string") return false;
  if (!("connectedAt" in value) || typeof value.connectedAt !== "number") return false;
  if (!("lastActiveAt" in value) || typeof value.lastActiveAt !== "number") return false;
  if (!("revoked" in value) || typeof value.revoked !== "boolean") return false;
  return true;
}

function approvalNetwork(address: string | null): MobileConnectNetwork {
  if (!address) return "unknown";
  if (address === "127.0.0.1" || address === "::1") return "loopback";
  if (/^100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./u.test(address)) return "tailscale";
  if (isPrivateIpv4(address)) return "private";
  return "public";
}

function cleanLabel(value: string | null | undefined, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.normalize("NFC").replace(/\p{C}/gu, "").replace(/\s+/gu, " ").trim();
  return text ? text.slice(0, max) : null;
}

interface ApprovalRequestRecord {
  requestId: string;
  host: MobileConnectHostBinding;
  deviceName: string;
  platform: MobileConnectedDevice["platform"];
  requestedAt: number;
  expiresAt: number;
  status: "pending" | "approved" | "rejected" | "expired";
  ticket?: string;
  requesterAddress: string | null;
  network: MobileConnectNetwork;
  deviceModel: string | null;
  osVersion: string | null;
  appVersion: string | null;
}

export class LocalMobileConnectService {
  #path: string | null;
  #host: MobileConnectHostBinding | null = null;
  #port: number | null = null;
  #originOverride: string | null = null;
  #tickets = new Map<
    string,
    { expiresAt: number; used: boolean; host: MobileConnectHostBinding; via: "code" | "link" }
  >();
  #link: { token: string; createdAt: number; host: MobileConnectHostBinding; revoked: boolean } | null = null;
  #devices = new Map<string, MobileConnectSessionRecord>();
  #approvalRequests = new Map<string, ApprovalRequestRecord>();

  constructor(path?: string | null) {
    this.#path = path ?? null;
    this.#load();
  }

  setPort(port: number | null): void {
    this.#port = port;
  }

  setHost(host: MobileConnectHostBinding | null): void {
    const changed = !sameHost(this.#host, host);
    this.#host = host;
    if (changed) {
      this.#tickets.clear();
      this.#link = null;
      this.#devices.clear();
      this.#approvalRequests.clear();
      this.#save();
    }
  }

  setOriginOverride(value: string | null): void {
    const trimmed = value?.trim();
    this.#originOverride = trimmed ? trimmed : null;
    this.#save();
  }

  getHost(): MobileConnectHostBinding | null {
    return this.#host;
  }

  getOrigin(): string | null {
    if (!this.#port) return null;
    if (this.#originOverride) {
      try {
        const u = new URL(this.#originOverride);
        if ((u.protocol === "http:" || u.protocol === "https:") && isPrivateIpv4(u.hostname.replace(/^\[|\]$/g, ""))) {
          return u.origin;
        }
      } catch {
        // fall through to auto
      }
    }
    const ip = resolveMobileConnectHostAddress(null);
    if (!ip) return null;
    return `http://${ip}:${this.#port}`;
  }

  #requireReady(): { host: MobileConnectHostBinding; origin: string } {
    const host = this.#host;
    if (!host) throw new Error("Mobile Connect host identity is not available.");
    const origin = this.getOrigin();
    if (!origin) {
      throw new Error("No private network address is available. Connect this computer to a LAN or Tailscale network.");
    }
    return { host, origin };
  }

  #qrData(origin: string, ticket: string, host: MobileConnectHostBinding): string {
    return `zollybot://mobile-connect?api=${encodeURIComponent(origin)}&ticket=${ticket}&host=${host.hostId}&fingerprint=${host.fingerprint}`;
  }

  createTicket(): MobileConnectTicket {
    const { host, origin } = this.#requireReady();
    const ticket = randomBytes(32).toString("base64url");
    const expiresAt = Date.now() + TICKET_TTL_MS;
    this.#tickets.set(ticket, { expiresAt, used: false, host, via: "code" });
    return { qrData: this.#qrData(origin, ticket, host), expiresAt };
  }

  cancelTicket(_ticket?: string): void {
    // Renderer does not send ticket id; ephemeral tickets expire naturally.
  }

  getLink(): MobileConnectLink | null {
    if (!this.#link || this.#link.revoked) return null;
    if (!this.#host || !sameHost(this.#link.host, this.#host)) return null;
    const origin = this.getOrigin();
    if (!origin) return null;
    return { url: this.#qrData(origin, this.#link.token, this.#host), createdAt: this.#link.createdAt };
  }

  createLink(): MobileConnectLink {
    const { host, origin } = this.#requireReady();
    if (this.#link) {
      this.#link.revoked = true;
      this.#tickets.delete(this.#link.token);
    }
    const token = randomBytes(32).toString("base64url");
    this.#tickets.set(token, { expiresAt: Number.MAX_SAFE_INTEGER, used: false, host, via: "link" });
    this.#link = { token, createdAt: Date.now(), host, revoked: false };
    this.#save();
    return { url: this.#qrData(origin, token, host), createdAt: this.#link.createdAt };
  }

  revokeLink(): void {
    if (!this.#link) return;
    this.#link.revoked = true;
    this.#tickets.delete(this.#link.token);
    this.#save();
  }

  redeem(
    ticket: string,
    deviceName: string,
    platform: MobileConnectedDevice["platform"],
  ): { sessionToken: string; sessionId: string } {
    const rec = this.#tickets.get(ticket);
    if (!rec) {
      throw new Error(
        "This code is not valid on this desktop. Create a new code in Mobile Connect and use it before restarting the desktop app.",
      );
    }
    if (rec.via === "code") {
      if (rec.used) throw new Error("This one-time code was already used. Create a new code in Mobile Connect.");
      if (rec.expiresAt < Date.now())
        throw new Error("This one-time code expired. Create a new code in Mobile Connect.");
    } else if (this.#link?.revoked || this.#link?.token !== ticket) {
      throw new Error("This permanent link is no longer valid. Create or copy a new permanent link in Mobile Connect.");
    }
    const host = this.#host;
    if (!host || !sameHost(rec.host, host)) {
      throw new Error(
        "This code belongs to a different desktop identity. Create a new code from the current desktop host.",
      );
    }
    if (rec.via === "code") {
      rec.used = true;
      this.#tickets.delete(ticket);
    }
    const sessionId = randomUUID();
    const sessionToken = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(sessionToken).digest("hex");
    this.#devices.set(sessionId, {
      sessionId,
      hostId: host.hostId,
      fingerprint: host.fingerprint,
      deviceName: deviceName || "Phone",
      platform,
      via: rec.via,
      tokenHash,
      connectedAt: Date.now(),
      lastActiveAt: Date.now(),
      revoked: false,
    });
    this.#save();
    return { sessionToken, sessionId };
  }

  listDevices(): MobileConnectedDevice[] {
    return [...this.#devices.values()]
      .filter(
        (d) => !d.revoked && this.#host && d.hostId === this.#host.hostId && d.fingerprint === this.#host.fingerprint,
      )
      .map((d) => ({
        sessionId: d.sessionId,
        name: d.deviceName,
        platform: d.platform,
        connectedAt: d.connectedAt,
        lastActiveAt: d.lastActiveAt,
        via: d.via,
      }));
  }

  revokeDevice(sessionId: string): void {
    const d = this.#devices.get(sessionId);
    if (!d) return;
    d.revoked = true;
    this.#save();
  }

  verifySession(sessionToken: string): MobileConnectSessionRecord | null {
    const hash = createHash("sha256").update(sessionToken).digest("hex");
    for (const d of this.#devices.values()) {
      if (d.tokenHash === hash && !d.revoked) {
        if (!this.#host || d.hostId !== this.#host.hostId || d.fingerprint !== this.#host.fingerprint) return null;
        d.lastActiveAt = Date.now();
        return d;
      }
    }
    return null;
  }

  #pruneApprovalRequests(): void {
    const now = Date.now();
    for (const [id, req] of this.#approvalRequests) {
      if (req.status === "pending" && req.expiresAt <= now) req.status = "expired";
      // Keep resolved requests briefly for polling clients, then remove.
      if (req.status !== "pending" && req.expiresAt + 60_000 <= now) this.#approvalRequests.delete(id);
    }
  }

  listApprovalRequests(): MobileConnectApprovalRequest[] {
    this.#pruneApprovalRequests();
    const host = this.#host;
    if (!host) return [];
    return [...this.#approvalRequests.values()]
      .filter((req) => req.status === "pending" && sameHost(req.host, host))
      .sort((a, b) => a.requestedAt - b.requestedAt)
      .map((req) => ({
        requestId: req.requestId,
        deviceName: req.deviceName,
        platform: req.platform,
        requestedAt: req.requestedAt,
        expiresAt: req.expiresAt,
        status: req.status,
        requesterAddress: req.requesterAddress,
        network: req.network,
        deviceModel: req.deviceModel,
        osVersion: req.osVersion,
        appVersion: req.appVersion,
      }));
  }

  createApprovalRequest(input: {
    deviceName: string;
    platform: MobileConnectedDevice["platform"];
    requesterAddress?: string | null;
    deviceModel?: string | null;
    osVersion?: string | null;
    appVersion?: string | null;
  }): MobileConnectApprovalRequestStatus {
    const { host } = this.#requireReady();
    this.#pruneApprovalRequests();
    const now = Date.now();
    const name = cleanLabel(input.deviceName, 80) ?? "Phone";
    const p: MobileConnectedDevice["platform"] =
      input.platform === "ios" || input.platform === "android" ? input.platform : "unknown";
    const rawAddress = input.requesterAddress?.trim() || null;
    const address = rawAddress?.startsWith("::ffff:") ? rawAddress.slice(7) : rawAddress;
    const req: ApprovalRequestRecord = {
      requestId: randomUUID(),
      host,
      deviceName: name,
      platform: p,
      requestedAt: now,
      expiresAt: now + APPROVAL_REQUEST_TTL_MS,
      status: "pending",
      requesterAddress: address,
      network: approvalNetwork(address),
      deviceModel: cleanLabel(input.deviceModel, 80),
      osVersion: cleanLabel(input.osVersion, 40),
      appVersion: cleanLabel(input.appVersion, 40),
    };
    this.#approvalRequests.set(req.requestId, req);
    return { requestId: req.requestId, status: req.status, expiresAt: req.expiresAt };
  }

  getApprovalRequestStatus(requestId: string): MobileConnectApprovalRequestStatus | null {
    this.#pruneApprovalRequests();
    const req = this.#approvalRequests.get(requestId);
    if (!req) return null;
    const host = this.#host;
    if (!host || !sameHost(req.host, host)) return null;
    if (req.status === "approved" && req.ticket) {
      const rec = this.#tickets.get(req.ticket);
      if (!rec || rec.used || rec.expiresAt < Date.now()) {
        req.status = "expired";
        req.ticket = undefined;
      }
    }
    return {
      requestId: req.requestId,
      status: req.status,
      expiresAt: req.expiresAt,
      ...(req.status === "approved" && req.ticket ? { ticket: req.ticket, host: req.host } : {}),
    };
  }

  approveApprovalRequest(requestId: string): void {
    this.#pruneApprovalRequests();
    const req = this.#approvalRequests.get(requestId);
    const host = this.#host;
    if (!req || !host || !sameHost(req.host, host)) throw new Error("Connect request not found.");
    if (req.status !== "pending") throw new Error("Connect request is no longer pending.");
    if (req.expiresAt <= Date.now()) {
      req.status = "expired";
      throw new Error("Connect request expired.");
    }
    const ticket = randomBytes(32).toString("base64url");
    const expiresAt = Date.now() + TICKET_TTL_MS;
    this.#tickets.set(ticket, { expiresAt, used: false, host, via: "code" });
    req.status = "approved";
    req.ticket = ticket;
    req.expiresAt = expiresAt;
  }

  rejectApprovalRequest(requestId: string): void {
    this.#pruneApprovalRequests();
    const req = this.#approvalRequests.get(requestId);
    const host = this.#host;
    if (!req || !host || !sameHost(req.host, host)) throw new Error("Connect request not found.");
    if (req.status !== "pending") throw new Error("Connect request is no longer pending.");
    req.status = "rejected";
  }

  #load(): void {
    if (!this.#path || !existsSync(this.#path)) return;
    try {
      const raw = JSON.parse(readFileSync(this.#path, "utf8"));
      if (typeof raw !== "object" || raw === null || !("version" in raw) || raw.version !== STORE_VERSION) return;
      const host = "host" in raw ? raw.host : null;
      const originOverride = "originOverride" in raw ? raw.originOverride : null;
      const link = "link" in raw ? raw.link : null;
      const devices = "devices" in raw ? raw.devices : null;
      this.#host = isHostBinding(host) ? host : null;
      this.#originOverride = typeof originOverride === "string" ? originOverride : null;
      this.#link = isStoredLink(link) ? link : null;
      this.#devices = new Map();
      if (Array.isArray(devices)) {
        for (const d of devices) {
          if (isSessionRecord(d)) this.#devices.set(d.sessionId, d);
        }
      }
      // Approval requests are ephemeral (in-memory) by design; drop on restart.
      this.#approvalRequests.clear();
      if (this.#link && !this.#link.revoked && this.#host && sameHost(this.#link.host, this.#host)) {
        this.#tickets.set(this.#link.token, {
          expiresAt: Number.MAX_SAFE_INTEGER,
          used: false,
          host: this.#link.host,
          via: "link",
        });
      }
    } catch {
      // ignore corrupt store
    }
  }

  #save(): void {
    if (!this.#path) return;
    try {
      mkdirSync(dirname(this.#path), { recursive: true });
      const state: StoredState = {
        version: STORE_VERSION,
        host: this.#host,
        originOverride: this.#originOverride,
        link: this.#link,
        devices: [...this.#devices.values()],
      };
      const tmp = `${this.#path}.tmp`;
      writeFileSync(tmp, JSON.stringify(state), "utf8");
      renameSync(tmp, this.#path);
    } catch {
      // ignore persistence errors
    }
  }
}
