import { type AgentProviderId, isAgentProvider, type ProviderTransport } from "@zollybot/contracts/agent-providers";
import { sourceText } from "@zollybot/i18n/source";
import { Effect, Result, Schema, Semaphore } from "effect";
import { isMissingFileError } from "../backend/file-errors";
import { PreferenceFileFailure, readPreferenceFile, writePreferenceFile } from "./preference-file";

const ProviderTransportFile = Schema.Struct({
  version: Schema.Literal(1),
  transports: Schema.Record(Schema.String, Schema.Literals(["acp", "cli"])),
});
const decodeProviderTransportFile = Schema.decodeUnknownResult(ProviderTransportFile);

export type ProviderTransportMap = Partial<Record<AgentProviderId, ProviderTransport>>;

/** The transport each provider runs on, when its driver has more than one. */
export class ProviderTransportSettingsStore {
  readonly #path: string;
  readonly #writes = Semaphore.makeUnsafe(1);
  #transports: ProviderTransportMap = {};
  #readOnly = false;

  constructor(path: string) {
    this.#path = path;
  }

  readonly load = Effect.fn("ProviderTransportSettings.load")(function* (this: ProviderTransportSettingsStore) {
    const result = yield* Effect.result(
      readPreferenceFile(this.#path, (value) => {
        const decoded = decodeProviderTransportFile(value);
        if (Result.isFailure(decoded)) return null;
        const transports: ProviderTransportMap = {};
        for (const [provider, transport] of Object.entries(decoded.success.transports)) {
          if (isAgentProvider(provider)) transports[provider] = transport;
        }
        return transports;
      }),
    );
    if (Result.isFailure(result)) {
      if (isMissingFileError(result.failure.cause)) return;
      if (!(result.failure.cause instanceof SyntaxError)) return yield* result.failure;
    } else if (result.success) {
      this.#transports = result.success;
      return;
    }
    this.#readOnly = true;
  }).bind(this);

  transports(): ProviderTransportMap {
    return { ...this.#transports };
  }

  readonly set = Effect.fn("ProviderTransportSettings.set")(function* (
    this: ProviderTransportSettingsStore,
    provider: string,
    transport: ProviderTransport,
  ) {
    return yield* this.#writes.withPermit(
      Effect.gen({ self: this }, function* () {
        if (this.#readOnly)
          return yield* new PreferenceFileFailure({
            cause: new Error(sourceText("error.harness.useSettingsReadOnly")),
          });
        const transports = { ...this.#transports, [provider]: transport };
        yield* writePreferenceFile(this.#path, { version: 1, transports }, { createDirectory: true });
        this.#transports = transports;
      }).pipe(Effect.uninterruptible),
    );
  }).bind(this);
}
