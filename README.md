# zollybot

**A governed, memory-driven agent office you can reach from any device.**

zollybot is the cross-platform front end to [zolly](https://github.com/khanshifaul/zolly)'s
per-repo offices. zolly itself is unchanged: the office kit, the CLI, the
queue/result contracts, the reviewer gate and the git-native state stay exactly
as they are.

- **Five platforms** — macOS, Windows, Linux (Electron desktop) and Android, iOS
  (Expo mobile).
- **Gates, not danger-full-access** — an office task cannot merge without the
  reviewer step, and money/production/publishing/customers stay `gate: human`.
  The gate engine sits in the backend path, not in a prompt.
- **Memory-driven, like zolly** — the bounded, git-committed store in
  `.agents/memory/` is the source of truth; zollybot reads it, surfaces it and
  writes only through the same atomic, secret-refusing CLI.
- **Per-repo offices** — an office is a repository, not a machine.

Status: base imported, integration not started.

## Base

The desktop shell, runtime adapters, queue substrate and mobile client come from
**ZollyBot 0.62.0** (upstream commit `9539f15`, 2026-11-06). Its original README,
build and contributor docs are kept in `README.upstream.md` and `docs/`.

## Design

- [docs/architecture.md](docs/architecture.md) — how zollybot works, the
  platform split, the ZollyBot reuse map, and the gate and memory invariants.

## Next

1. `src/backend/zolly/` adapter: discover offices (repos with `.agents/`),
   invoke the unchanged `zolly` CLI, map its queue and gates onto the backend.
2. `packages/contracts`: a `zolly-office-v1` capability (offices, queue, gate,
   approve, recall) alongside the existing `storage-v1` pattern.
3. Renderer: Offices screen, queue board, gate card.
