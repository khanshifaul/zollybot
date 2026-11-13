# `apps/status`

Public status page app and update tooling.

- **Stack:** Vite + SolidJS (`@zollybot/status`).
- **Location:** `apps/status/src/`, static entry `apps/status/index.html`, scripts in `apps/status/scripts/`.
- **Scripts:** `bun run --cwd apps/status dev|build|typecheck`, `bun run status:build`, `bun run status:smoke`.

The page loads `status.json` and refreshes periodically to show current service/component status.
