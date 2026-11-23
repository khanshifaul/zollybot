import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";
import { isDynamicRecord } from "@zollybot/contracts/runtime-values";
import type { OfficeTask } from "./office-task-store";

/** Where a task's isolated checkout lives inside its office repository. */
export function taskWorktreePath(repoPath: string, taskId: string): string {
  return join(repoPath, ".agents", "worktrees", taskId);
}

/**
 * Creates a detached git worktree for one task. Returns the path, or null when
 * the office is not a git checkout or git refused (the task then runs in the repo).
 */
export function createTaskWorktree(repoPath: string, taskId: string): string | null {
  const path = taskWorktreePath(repoPath, taskId);
  if (existsSync(path)) return path;
  if (!existsSync(repoPath)) return null;
  try {
    mkdirSync(join(repoPath, ".agents", "worktrees"), { recursive: true });
  } catch {
    return null;
  }
  const result = spawnSync("git", ["worktree", "add", "--detach", path], {
    cwd: repoPath,
    encoding: "utf8",
  });
  return result.status === 0 ? path : null;
}

/** Removes one task worktree, then prunes stale git records. Never throws. */
export function removeTaskWorktree(repoPath: string, path: string): boolean {
  if (!existsSync(path)) return false;
  const result = spawnSync("git", ["worktree", "remove", "--force", path], {
    cwd: repoPath,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    spawnSync("git", ["worktree", "prune"], { cwd: repoPath, encoding: "utf8" });
  }
  return true;
}

function officeRepoPath(db: DatabaseSync, officeId: string): string | null {
  const row = db.prepare("SELECT repo_path FROM offices WHERE id = ?").get(officeId);
  return isDynamicRecord(row) && typeof row.repo_path === "string" ? row.repo_path : null;
}

/**
 * Garbage collector: drop the worktree of a task that is merged (or closed).
 * Runs after merge; a missing worktree is a no-op.
 */
export function collectMergedTaskWorktree(db: DatabaseSync, task: OfficeTask): boolean {
  if (!task.worktreePath) return false;
  const repoPath = officeRepoPath(db, task.officeId);
  if (!repoPath) return false;
  const removed = removeTaskWorktree(repoPath, task.worktreePath);
  if (removed) {
    db.prepare("UPDATE office_tasks SET worktree_path = NULL, updated_at = ? WHERE id = ?").run(
      new Date().toISOString(),
      task.id,
    );
  }
  return removed;
}

/** Sweeps worktrees for every merged task that still records a path. */
export function sweepMergedTaskWorktrees(db: DatabaseSync): number {
  const rows = db
    .prepare(
      "SELECT id, office_id, worktree_path FROM office_tasks WHERE worktree_path IS NOT NULL AND status = 'done'",
    )
    .all();
  let removed = 0;
  for (const row of rows) {
    if (!isDynamicRecord(row)) continue;
    const officeId = typeof row.office_id === "string" ? row.office_id : "";
    const worktreePath = typeof row.worktree_path === "string" ? row.worktree_path : "";
    if (!officeId || !worktreePath) continue;
    const repoPath = officeRepoPath(db, officeId);
    if (!repoPath) continue;
    if (removeTaskWorktree(repoPath, worktreePath)) {
      removed += 1;
      db.prepare("UPDATE office_tasks SET worktree_path = NULL, updated_at = ? WHERE id = ?").run(
        new Date().toISOString(),
        String(row.id ?? ""),
      );
    }
  }
  return removed;
}
