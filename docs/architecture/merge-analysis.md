# zollybot vs OpenBot vs zolly vs herdr — comparison

> **Historical/design note:** This document records earlier design, merge, or import context. It may not describe the current checked-in implementation. Use `docs/architecture/structure.md`, `docs/onboarding/`, and source code for current behavior.

Date: 2026-11-08. This file compares the four systems. The plan is in
[merge-spec.md](merge-spec.md); the evidence and corrections are in [merge-impact.md](merge-impact.md).

## What each thing is

| | zolly | herdr | OpenBot | zollybot (this repo) |
|---|---|---|---|---|
| Kind | Repo-local control plane, Rust CLI | Terminal workspace manager | Electron + Solid desktop app, 17 providers, mobile | Fork of OpenBot + an offices layer |
| Unit of work | Task branch → worktree → worker → reviewer | Pane, tab, workspace, worktree | Agent → workspace → conversation → task | Office (repo) → employed agent → office task |
| Runtime | herdr panes; omp pinned | Hosts any CLI in a pane | 17 provider CLIs + ACP | 17 + `omp` (planned) |
| State | git + `.agents/` files | Socket API, config | SQLite (`zollybot.db`) + `orchestration_events` | same DB, plus offices at migration 59 |
| Memory | Bounded text files, 24 KB, atomic, secret-refusing, committed | none | Per-agent DB memories, essential/searchable, review, redaction | per-agent today; per-office planned |
| Gate | Documented reviewer + `gate: human` | none | Tool approvals, access levels, workflow approval steps | `pr-reviewer` role exists; merge IPC missing |
| Queue | File queue + briefs | none | Agent message queue and agent tasks; no durable task queue | same |
| Interfaces | Terminal, Telegram, MCP | Terminal + socket API | Desktop, mobile, local control socket, Team API | + TUI (Rust crate) over the control socket |
| Isolation | Same OS user; worktrees only | Panes, no sandbox | Access levels, workspace sandbox, provider confinement | same; office seats must be "Ask first" |
| Licence | Apache-2.0 | Apache-2.0 (packaged licence file) | PolyForm Noncommercial | PolyForm Noncommercial |

## Where the two models conflict

| Conflict | zolly | OpenBot | Resolution in the spec |
|---|---|---|---|
| Memory store | `.agents/memory/*.md`, bounded, committed | per-agent SQLite rows with tiers and review | one DB table per office; `.md` imported once then archived |
| Memory owner | office (repo) | agent | office memory by employment |
| Queue | files, one worker per task, reviewer gate | message queue + agent tasks, no leases | new durable table and dispatcher |
| Merge authority | reviewer is the only door | no merge authority concept | `pr-reviewer` sets a marker; merge IPC enforces it |
| Human gates | prompt + documented convention | tool approvals enforced in code | backend gate rows and approvals |
| Agent identity | seat kind, omp by default | provider per agent, switchable | provider per seat, no pinning |
| Worktree | per task, under `.agents/worktrees` | workspace per agent | office task owns the worktree |
| State of record | git and files | SQLite | SQLite; files are import/export |

## Duplicates to avoid

Already in OpenBot and not to be rebuilt: office registration, floors/lobby, employment and roles,
butler seeding, tool approvals and approval cards, agent tasks with holds and branches, routines and
workflows, context compaction, agent delegation and channel tasks, the control socket, and the Team
API WebSocket.

## Why OpenBot is the base

One codebase ships desktop, web, mobile, and the control socket. Rebuilding those surfaces for a
zolly-native app is the largest part of the work and adds no governance. The merge keeps OpenBot's
surfaces and adds zolly's office, gate, and memory semantics in the backend.
