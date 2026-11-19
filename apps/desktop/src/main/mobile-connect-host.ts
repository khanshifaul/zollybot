import type { MobileConnectHostBinding } from "@zollybot/contracts/mobile-connect";
import { sourceText } from "@zollybot/i18n/source";
import { Effect } from "effect";
import { RemoteWorkflowError } from "./remote-service-effects";

interface LocalMobileConnectHost {
  configure(input: { serverName: string }): Effect.Effect<unknown, RemoteWorkflowError>;
  getStatus(): { configured: boolean; phase: string; apiOnline: boolean };
  getMobileConnectHost(): MobileConnectHostBinding | null;
  getLocalApiPort(): number | null;
  start(): Effect.Effect<unknown, RemoteWorkflowError>;
}

/** Ensures local host identity and API are ready for private-network Mobile Connect. */
export const ensureLocalMobileConnectHost = (host: LocalMobileConnectHost) =>
  Effect.gen(function* () {
    if (!host.getStatus().configured) yield* host.configure({ serverName: "ZollyBot" });
    let status = host.getStatus();
    if (status.phase !== "online" || !status.apiOnline) {
      yield* host.start().pipe(Effect.catch(() => Effect.void));
      status = host.getStatus();
    }
    const binding = host.getMobileConnectHost();
    const port = host.getLocalApiPort();
    if (!binding || !port || status.phase === "error") {
      return yield* Effect.fail(
        new RemoteWorkflowError({
          cause: new Error(sourceText("error.host.mobileConnectPublishFailed")),
        }),
      );
    }
    return binding;
  });
