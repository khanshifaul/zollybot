# Repo structure (target)

## Source

- `apps/desktop/`: Electron app (`src/main|preload|renderer|backend`), `tui/` (Rust CLI/TUI, cross-platform), `resources/` (runtime payloads), `build-resources/` (packaging inputs).
- `apps/mobile/`: Expo/React Native app.
- `apps/web/`: Next.js web/marketing site, deployed as a server on Vercel.
- `integrations/{discord,slack,telegram}/`: external platform manifests and runbooks.
- `packages/*`: shared workspace libraries (`contracts`, `ui`, `i18n`, `team-client`, `logging`, `telemetry`, `user-errors`, `whatsapp`, `brand`).
- `marketplace/`: canonical shared catalog/content source.
- `remote/`, `crates/` (if any non-desktop), `docker/`, `nix/`, `packaging/`, `site/`, `scripts/`, `tools/`.

## Outputs and distributables

- **All final distributables go under `out/`** (gitignored):
  - `out/desktop/compile/`: electron-vite compiled app.
  - `out/desktop/dist/<os-arch>/`: installers/packages/unpacked/updater metadata/checksums/SBOMs.
  - `out/mobile/{android,ios}/`: AAB/APK/IPA.
  - `out/cli/<os-arch>/zollybot-cli(.exe)`: TUI/CLI binaries (bundled in desktop packages and released).
  - `out/site/`: assembled install-site bundle.

## Policy

- Share code/assets only when multiple targets consume them (`packages/`, canonical `marketplace/`).
- Keep platform-specific packaging/runtime inputs with their app (`apps/desktop/resources`, `apps/desktop/build-resources`, `apps/mobile/assets`).
- Do not commit generated outputs, caches, or stray bundles in source roots.
