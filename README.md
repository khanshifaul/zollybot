# zollybot

**A governed, memory-driven agent office you can reach from any device.**

zollybot is the cross-platform front end to [zolly](https://github.com/khanshifaul/zolly)'s
per-repo offices. zolly itself is unchanged: the office kit, the CLI, the
queue/result contracts, the reviewer gate and the git-native state stay exactly
as they are.

- **Five platforms** — macOS, Windows, Linux (Electron desktop) and Android, iOS
  (Expo mobile).
- **Gates, not danger-full-access** — a task bound to an office cannot merge
  without the reviewer step, and money/production/publishing/customers stay
  `gate: human`. The gate engine sits in the backend path, not in a prompt.
- **Memory-driven, like zolly** — the bounded, git-committed memory store in
  `.agents/memory/` is the source of truth. zollybot reads it, surfaces it and
  writes through the same atomic, secret-refusing path; it never forks it into a
  second database.
- **Per-repo offices** — an office is a repository, not a machine. Switch
  offices in the app; nothing is shared implicitly.

Status: design. No application code yet.

## Design

See [docs/architecture.md](docs/architecture.md).

## Relationship to OpenBot

zollybot is planned as a fork of [OpenBot](https://github.com/nightly-labs/openbot)
for the desktop shell, the runtime adapters, the queue substrate and the mobile
client, with a zolly integration layer on top. OpenBot's default of running
agents with `danger-full-access` and approvals off is explicitly replaced by
zolly's gate model.
