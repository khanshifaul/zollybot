import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { isDynamicRecord, isString } from "@zollybot/contracts/runtime-values";
import { SIGNAL_PROTOCOL_VERSION } from "@zollybot/contracts/signal-protocol/messages";
import { type WebSocket, WebSocketServer } from "ws";
import type { VerifiedRemoteSessionTicket } from "../central-auth-manager";

/** A private-network STUN server is unnecessary on a LAN/Tailscale path; another binding only delays joining. */
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];
const SESSION_TTL_MS = 12 * 60 * 60 * 1_000;
const TICKET_TTL_MS = 5 * 60 * 1_000;
const MESSAGE_BYTES_LIMIT = 64 * 1024;

export interface LocalSignalSession {
  sessionId: string;
  hostId: string;
  userId: string;
  membershipId: string;
  role: "owner" | "admin" | "member";
  expiresAt: number;
}

interface TicketRecord {
  sessionId: string;
  expiresAt: number;
}

interface ClientPeer {
  socket: WebSocket;
  connectionId: string;
  sessionId: string;
  hostId: string;
}

/**
 * The Signal relay a phone reaches on the same LAN/Tailscale network as this desktop.
 *
 * It speaks the same wire protocol as the hosted Signal service, for one host and its local mobile
 * sessions: the desktop's host peer connects to `/v1/signal` with the host token, a phone connects
 * with a session ticket from `/v2/remote/sessions/:id/ticket`, and this relays offers, answers and
 * ICE candidates between them. Team commands themselves travel on the WebRTC data channels.
 */
export class LocalSignalService {
  readonly #sockets = new WebSocketServer({ noServer: true, maxPayload: MESSAGE_BYTES_LIMIT });
  readonly #hostToken = randomBytes(32).toString("base64url");
  /** Signs the client tickets that this process mints and the host peer verifies. */
  readonly #ticketKey = randomBytes(32);
  #host: { socket: WebSocket; resumeToken: string } | null = null;
  readonly #sessions = new Map<string, LocalSignalSession>();
  readonly #tickets = new Map<string, TicketRecord>();
  readonly #clients = new Map<string, ClientPeer>();

  constructor() {
    this.#sockets.on("connection", (socket) => this.#attach(socket));
  }

  /** The token the desktop's host peer passes in its `hello`. It never leaves this process. */
  hostTicket(): string {
    return this.#hostToken;
  }

  createSession(input: Omit<LocalSignalSession, "sessionId" | "expiresAt">): LocalSignalSession {
    const session: LocalSignalSession = {
      ...input,
      sessionId: randomUUID(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    this.#sessions.set(session.sessionId, session);
    return session;
  }

  session(sessionId: string): LocalSignalSession | null {
    const session = this.#sessions.get(sessionId);
    if (!session) return null;
    if (session.expiresAt <= Date.now()) {
      this.#sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  endSession(sessionId: string): void {
    this.#sessions.delete(sessionId);
    for (const [ticket, record] of this.#tickets) if (record.sessionId === sessionId) this.#tickets.delete(ticket);
    for (const [connectionId, client] of this.#clients) {
      if (client.sessionId !== sessionId) continue;
      this.#clients.delete(connectionId);
      client.socket.close();
    }
  }

  issueTicket(sessionId: string, clientPublicKey: string): { ticket: string; expiresAt: number } {
    const session = this.session(sessionId);
    if (!session) throw new Error("The connection session ended.");
    const claims: VerifiedRemoteSessionTicket = {
      sessionId: session.sessionId,
      hostId: session.hostId,
      userId: session.userId,
      membershipId: session.membershipId,
      authEpoch: 1,
      sessionExpiresAt: Math.floor(session.expiresAt / 1_000),
      role: session.role,
      clientPublicKey,
    };
    const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const mac = createHmac("sha256", this.#ticketKey).update(payload).digest("base64url");
    const ticket = `l1.${payload}.${mac}`;
    const expiresAt = Math.min(session.expiresAt, Date.now() + TICKET_TTL_MS);
    this.#tickets.set(ticket, { sessionId, expiresAt });
    return { ticket, expiresAt };
  }

  /** The host peer's check of a client ticket; only this process can mint one. */
  verifyRemoteSessionTicket(ticket: string): VerifiedRemoteSessionTicket {
    const [version, payload, mac] = ticket.split(".");
    if (version !== "l1" || !payload || !mac) throw new Error("The client ticket is invalid.");
    const expected = createHmac("sha256", this.#ticketKey).update(payload).digest();
    const received = Buffer.from(mac, "base64url");
    if (received.length !== expected.length || !timingSafeEqual(received, expected))
      throw new Error("The client ticket is invalid.");
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!isDynamicRecord(value)) throw new Error("The client ticket is invalid.");
    if (
      !isString(value.sessionId) ||
      !isString(value.hostId) ||
      !isString(value.userId) ||
      !isString(value.membershipId) ||
      !isString(value.clientPublicKey) ||
      typeof value.authEpoch !== "number" ||
      typeof value.sessionExpiresAt !== "number" ||
      (value.role !== "owner" && value.role !== "admin" && value.role !== "member")
    )
      throw new Error("The client ticket is invalid.");
    if (value.sessionExpiresAt * 1_000 <= Date.now()) throw new Error("The client ticket expired.");
    return {
      sessionId: value.sessionId,
      hostId: value.hostId,
      userId: value.userId,
      membershipId: value.membershipId,
      authEpoch: value.authEpoch,
      sessionExpiresAt: value.sessionExpiresAt,
      role: value.role,
      clientPublicKey: value.clientPublicKey,
    };
  }

  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void {
    this.#sockets.handleUpgrade(request, socket, head, (client) => {
      this.#sockets.emit("connection", client, request);
    });
  }

  dispose(): void {
    for (const client of this.#clients.values()) client.socket.close();
    this.#clients.clear();
    this.#sessions.clear();
    this.#tickets.clear();
    this.#host?.socket.close();
    this.#host = null;
    this.#sockets.close();
  }

  #attach(socket: WebSocket): void {
    let role: "host" | "client" | null = null;
    let connectionId: string | null = null;

    socket.on("message", (data) => {
      let frame: unknown;
      try {
        frame = JSON.parse(data.toString());
      } catch {
        return;
      }
      if (!isDynamicRecord(frame) || !isString(frame.type)) return;
      if (frame.type === "hello") {
        if (role !== null) return;
        const peer = frame.peer;
        const token = isString(frame.token) ? frame.token : "";
        if (peer === "host" && token === this.#hostToken) {
          role = "host";
          this.#host?.socket.close();
          this.#host = { socket, resumeToken: randomBytes(24).toString("base64url") };
          this.#sendReady(socket, null, this.#host.resumeToken);
          return;
        }
        if (peer === "client") {
          const ticket = this.#tickets.get(token);
          if (!ticket || ticket.expiresAt <= Date.now()) {
            this.#send(socket, {
              type: "error",
              version: SIGNAL_PROTOCOL_VERSION,
              code: "authentication_required",
              message: "The connection ticket is not valid.",
            });
            socket.close();
            return;
          }
          const session = this.session(ticket.sessionId);
          if (!session) {
            this.#send(socket, {
              type: "error",
              version: SIGNAL_PROTOCOL_VERSION,
              code: "session_revoked",
              message: "The connection session ended.",
            });
            socket.close();
            return;
          }
          const host = this.#host;
          if (!host || host.socket.readyState !== host.socket.OPEN) {
            this.#send(socket, {
              type: "error",
              version: SIGNAL_PROTOCOL_VERSION,
              code: "host_unavailable",
              message: "The desktop is not online.",
            });
            socket.close();
            return;
          }
          role = "client";
          connectionId = randomUUID();
          this.#clients.set(connectionId, {
            socket,
            connectionId,
            sessionId: session.sessionId,
            hostId: session.hostId,
          });
          this.#sendReady(socket, connectionId, randomBytes(24).toString("base64url"));
          this.#send(host.socket, {
            type: "peer-ready",
            version: SIGNAL_PROTOCOL_VERSION,
            connectionId,
            sessionId: session.sessionId,
            userId: session.userId,
            membershipId: session.membershipId,
            role: session.role,
            // The Signal `peer-ready` claim is seconds; the host multiplies it by 1000.
            sessionExpiresAt: Math.floor(session.expiresAt / 1_000),
            resumed: false,
          });
          return;
        }
        this.#send(socket, {
          type: "error",
          version: SIGNAL_PROTOCOL_VERSION,
          code: "authentication_required",
          message: "The connection is not authenticated.",
        });
        socket.close();
        return;
      }

      if (frame.type === "turn-refresh") {
        this.#sendReady(socket, null, randomBytes(24).toString("base64url"));
        return;
      }

      if (role === "client") {
        const host = this.#host;
        if (host && host.socket.readyState === host.socket.OPEN) this.#send(host.socket, frame);
        return;
      }
      if (role === "host") {
        const id = isString(frame.connectionId) ? frame.connectionId : null;
        const client = id ? this.#clients.get(id) : undefined;
        if (client && client.socket.readyState === client.socket.OPEN) this.#send(client.socket, frame);
        if (frame.type === "disconnect" && id) this.#clients.delete(id);
      }
    });

    socket.on("close", () => {
      if (role === "host" && this.#host?.socket === socket) this.#host = null;
      if (role === "client" && connectionId) {
        const client = this.#clients.get(connectionId);
        this.#clients.delete(connectionId);
        const host = this.#host;
        if (client && host && host.socket.readyState === host.socket.OPEN) {
          this.#send(host.socket, {
            type: "disconnect",
            version: SIGNAL_PROTOCOL_VERSION,
            connectionId,
          });
        }
      }
    });
  }

  #sendReady(socket: WebSocket, connectionId: string | null, resumeToken: string): void {
    this.#send(socket, {
      type: "ready",
      version: SIGNAL_PROTOCOL_VERSION,
      connectionId,
      resumeToken,
      iceServers: ICE_SERVERS,
    });
  }

  #send(socket: WebSocket, value: unknown): void {
    if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(value));
  }
}
