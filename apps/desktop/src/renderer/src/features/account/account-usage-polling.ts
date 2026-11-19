import { createEffect, createMemo, untrack } from "solid-js";
import { useAgents } from "../agents/agents-context";
import { useServers } from "../servers/servers-context";

/**
 * Stub for local-only app. No account service, no plan limits.
 */
export function useAccountUsagePolling() {
  const { agentStatus } = useAgents();
  const { activeServerId } = useServers();
  const usageReady = createMemo(() => {
    const status = agentStatus();
    return (
      status.phase === "ready" ||
      Boolean(status.providers?.some((item) => item.state === "available" && item.connectionState !== "connecting"))
    );
  });
  const usageTargetKey = createMemo(() => {
    const serverId = activeServerId();
    if (!serverId) return null;
    const status = agentStatus();
    const connected = (status.providers ?? [])
      .filter((item) => item.state === "available" && item.connectionState !== "connecting")
      .map((item) => item.id)
      .sort()
      .join(",");
    return `${serverId}:${connected}`;
  });
  const providersLoading = createMemo(() => {
    const status = agentStatus();
    return (
      status.phase === "starting" ||
      status.phase === "restarting" ||
      Boolean(status.providers?.some((item) => item.state === "checking" || item.connectionState === "connecting"))
    );
  });
  let selectedServerId: string | null = null;

  createEffect(
    () => usageTargetKey(),
    () =>
      untrack(() => {
        const serverId = activeServerId() ?? null;
        if (serverId !== selectedServerId) {
          selectedServerId = serverId;
        }
      }),
  );

  createEffect(
    () => usageReady() || providersLoading(),
    () => {
      // no-op
    },
  );
}
