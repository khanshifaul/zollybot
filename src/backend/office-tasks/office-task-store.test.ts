// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCauseEffect } from "../effect-boundary";
import { ZollyBotDatabase } from "../zollybot-database";
import { OfficeTaskStore } from "./office-task-store";

const roots: string[] = [];
afterEach(async () => { await Promise.all(roots.splice(0).map((r) => rm(r, { recursive: true, force: true }))); });

async function db(root?: string): Promise<ZollyBotDatabase> {
  const dir = root ?? await mkdtemp(join(tmpdir(), "zollybot-office-task-"));
  if (!root) roots.push(dir);
  const d = new ZollyBotDatabase(dir); await runCauseEffect(d.initialize());
  try { d.connection.prepare("INSERT INTO offices (id, repo_path, name, remote, base_branch, created_at, last_opened_at) VALUES ('o1','/repo','R',NULL,'main',1,NULL)").run(); } catch {}
  return d;
}

describe("office task store", () => {
  it("creates, pauses/resumes, claims, and recovers expired leases", async () => {
    const d = await db(); const s = new OfficeTaskStore(d);
    const t = s.create({ officeId: "o1", title: "T", brief: "B" });
    expect(t.status).toBe("queued");
    s.pause(t.id); expect(s.get(t.id)?.status).toBe("paused");
    s.resume(t.id); expect(s.get(t.id)?.status).toBe("queued");
    const claimed = s.claimNext("o1", "w", 1);
    expect(claimed?.status).toBe("dispatched");
    await new Promise((r) => setTimeout(r, 5));
    const rec = s.recoverExpiredLeases(3);
    expect(rec[0]?.status).toBe("queued");
    d.close();
  });

  it("boot recovery: expired dispatched lease survives restart", async () => {
    const root = await mkdtemp(join(tmpdir(), "zollybot-office-task-boot-")); roots.push(root);
    const d1 = await db(root); const s1 = new OfficeTaskStore(d1);
    const t = s1.create({ officeId: "o1", title: "T", brief: "B" });
    s1.claimNext("o1", "w", 1);
    await new Promise((r) => setTimeout(r, 5));
    d1.close();
    const d2 = await db(root); const s2 = new OfficeTaskStore(d2);
    const rec = s2.recoverExpiredLeases(3);
    expect(rec.some((x) => x.id === t.id)).toBe(true);
    expect(s2.get(t.id)?.status).toBe("queued");
    d2.close();
  });

    it("merge requires done and pr-reviewer review pass", async () => {
    const d = await db(); const s = new OfficeTaskStore(d);
    const t = s.create({ officeId: "o1", title: "T", brief: "B" });
    expect(s.merge(t.id, "a").ok).toBe(false);
    s.setStatus(t.id, "done");
    expect(s.merge(t.id, "a").error).toBe("merge_requires_review_pass");
    s.setReviewPass(t.id, "pr-reviewer");
    expect(s.merge(t.id, "pr-reviewer").ok).toBe(true);
    d.close();
  });

  it("allows only one dispatched task per office", async () => {
    const d = await db(); const s = new OfficeTaskStore(d);
    s.create({ officeId: "o1", title: "A", brief: "a" });
    s.create({ officeId: "o1", title: "B", brief: "b" });
    expect(s.claimNext("o1","w",60_000)?.title).toBe("A");
    expect(s.claimNext("o1","w",60_000)).toBeNull();
    d.close();
  });
});
