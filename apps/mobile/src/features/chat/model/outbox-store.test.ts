import { describe, expect, it, vi } from "vitest";
import type { OutboxMessage } from "./outbox";
import { OutboxStore } from "./outbox-store";

const target = { kind: "agent" as const, serverId: "server-1", agentId: "agent-1" };
type Deliver = ConstructorParameters<typeof OutboxStore>[0]["deliver"];

function store(deliver: Deliver, online: string[] = []) {
  const outbox = new OutboxStore({
    storage: null,
    deliver,
    describeError: (error) => String(error),
    now: () => Date.parse("2026-11-28T10:00:00.000Z"),
    randomId: () => "client-1",
  });
  outbox.setOnline(new Set(online));
  return outbox;
}

describe("OutboxStore offline queue", () => {
  it("keeps a prompt while its server is offline and sends it when the server returns", async () => {
    const deliver = vi.fn(async (_message: OutboxMessage) => ({ messageId: "message-1" }));
    const outbox = store(deliver);
    await outbox.load();

    outbox.add(target, { text: "Ship it", replyToMessageId: null, files: [] });
    expect(outbox.snapshot().messages[0]?.state).toBe("waiting");
    expect(deliver).not.toHaveBeenCalled();

    outbox.setOnline(new Set(["server-1"]));
    await vi.waitFor(() => expect(deliver).toHaveBeenCalledTimes(1));
    expect(await vi.waitFor(() => outbox.snapshot().messages[0]?.state)).toBe("sent");
    expect(deliver.mock.calls[0]?.[0]).toMatchObject({ text: "Ship it", target });
  });
});
