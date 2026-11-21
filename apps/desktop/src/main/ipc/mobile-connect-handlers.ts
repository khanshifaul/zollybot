import { runCauseEffect } from "../../backend/effect-boundary";
import type { HostService } from "../host-service";
import type { LocalMobileConnectService } from "../mobile-connect/local-mobile-connect-service";
import { handler, type IpcGroupHandlers, payloadHandler } from "./define-ipc-group";

function decodeSessionId(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) throw new Error("Invalid Mobile Connect session.");
  return value;
}

function decodeRequestId(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) throw new Error("Invalid Mobile Connect request.");
  return value;
}

function syncHost(service: LocalMobileConnectService, host: HostService): void {
  service.setHost(host.getMobileConnectHost());
  service.setPort(host.getLocalApiPort());
}

function ensureReady(service: LocalMobileConnectService, host: HostService): void {
  syncHost(service, host);
  if (!host.getMobileConnectHost()) {
    throw new Error("Mobile Connect is not ready. Configure this host, then try again.");
  }
  if (!host.getLocalApiPort()) {
    throw new Error("Mobile Connect API is not running. Restart the app or host, then try again.");
  }
  if (!service.getOrigin()) {
    throw new Error(
      "No private or Tailscale network address was found. Connect this computer to LAN/Tailscale, then try again.",
    );
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "cause" in error) {
    const cause = error.cause;
    if (cause instanceof Error && cause.message) return cause.message;
  }
  return "Mobile Connect could not start.";
}

async function ensureHostStarted(host: HostService): Promise<void> {
  try {
    if (!host.getStatus().configured) {
      await runCauseEffect(host.configure({ serverName: "ZollyBot" }));
    }
    const status = host.getStatus();
    if (status.phase !== "online" || !status.apiOnline || !host.getLocalApiPort()) {
      // A local-only host meets phones on its own Signal relay, which a full start brings up.
      await runCauseEffect(host.start());
    }
  } catch (error) {
    throw new Error(errorMessage(error));
  }
}

export function mobileConnectIpcHandlers(
  service: LocalMobileConnectService,
  host: HostService,
): Pick<IpcGroupHandlers, "mobileConnect"> {
  return {
    mobileConnect: {
      create: handler(async () => {
        await ensureHostStarted(host);
        ensureReady(service, host);
        return service.createTicket();
      }),
      cancel: handler(() => {
        service.cancelTicket();
      }),
      getLink: handler(async () => {
        try {
          await ensureHostStarted(host);
        } catch {
          // Best-effort.
        }
        syncHost(service, host);
        return service.getLink();
      }),
      createLink: handler(async () => {
        await ensureHostStarted(host);
        ensureReady(service, host);
        return service.createLink();
      }),
      revokeLink: handler(() => {
        service.revokeLink();
      }),
      listDevices: handler(async () => {
        try {
          await ensureHostStarted(host);
        } catch {
          // Best-effort.
        }
        syncHost(service, host);
        return service.listDevices();
      }),
      revokeDevice: payloadHandler(decodeSessionId, (sessionId) => {
        service.revokeDevice(sessionId);
      }),
      listRequests: handler(async () => {
        try {
          await ensureHostStarted(host);
        } catch {
          // Best-effort: local API may be unavailable until host is configured/startable.
        }
        syncHost(service, host);
        return service.listApprovalRequests();
      }),
      approveRequest: payloadHandler(decodeRequestId, (requestId) => {
        syncHost(service, host);
        service.approveApprovalRequest(requestId);
      }),
      rejectRequest: payloadHandler(decodeRequestId, (requestId) => {
        syncHost(service, host);
        service.rejectApprovalRequest(requestId);
      }),
    },
  };
}
