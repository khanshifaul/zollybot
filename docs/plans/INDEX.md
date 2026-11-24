# ZollyBot Plan Index

Last updated: 2026-11-24.

This file lists the engineering plans in this directory, their current state, and the work that is
planned but not yet implemented. It is an index, not a replacement for each plan.

## Plans

| Plan                                                                                                                 | Scope                                                                                                                                      | Status                                                 |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| [`2026-11-23-gitnexus-plan-web-mobile-release-updates.md`](./2026-11-23-gitnexus-plan-web-mobile-release-updates.md) | Post-0.64.4 desktop/mobile/web release program: office ledger parity, branded web landing page, verified command surface, update discovery | Active; implementation partly landed                   |
| [`2026-11-23-office-repo-state.md`](./2026-11-23-office-repo-state.md)                                               | Recoverable office, agent, channel, and ledger state from the office repository                                                            | Planned                                                |
| [`2026-11-23-web-marketplace.md`](./2026-11-23-web-marketplace.md)                                                   | Public Marketplace pages for agents and skills                                                                                             | Planned                                                |
| [`jarvis-mobile-assistant.md`](./jarvis-mobile-assistant.md)                                                         | Mobile Jarvis: main screen, voice loop, wake word, local models                                                                            | Phases 1–2c landed; iOS speaker extraction pending     |
| [`2026-11-24-gitnexus-plan-tui-desktop-parity.md`](./2026-11-24-gitnexus-plan-tui-desktop-parity.md)                 | Desktop-parity TUI/CLI plan                                                                                                                | Not yet published; draft exists at `/tmp/tui-plan.md`  |
| [`2026-11-24-gitnexus-plan-mobile-multi-host.md`](./2026-11-24-gitnexus-plan-mobile-multi-host.md)                   | Multiple local ZollyBot hosts over Tailscale                                                                                               | Implementing; core storage/context/workspace/UI landed |

Supporting wireframes:

- [`jarvis-wireframes.svg`](./jarvis-wireframes.svg)
- [`mobile-wireframes-full.svg`](./mobile-wireframes-full.svg)
- `out/plans/tui-wireframe.svg` (desktop-matched TUI wireframe; generated artifact, not under `docs/plans/`)

## Planned but unimplemented

### TUI / `zollybot-cli`

- [ ] Publish the full TUI parity plan at `docs/plans/2026-11-24-gitnexus-plan-tui-desktop-parity.md`.
- [ ] Split `apps/desktop/tui/src/main.rs` into API, state/update, UI, PTY, and test modules.
- [ ] Make rendering pure; move control-socket reads and PTY work out of `draw()`.
- [ ] Add `/v2` JSON snapshot/change/conversation/action API beside `/v1`.
- [ ] Implement the desktop-parity shell: top bar, server rail, page rail, sidebar, conversation, composer, palette, dialogs.
- [ ] Generate Rust theme constants from `packages/brand/src/tokens.css`.
- [ ] Add Rust protocol, worker, and `TestBackend` snapshot tests.
- [ ] Add a TUI CI job (`cargo fmt`, `clippy`, `test`, `cli:build:host`).
- [ ] Add macOS socket and Windows named-pipe control endpoints.
- [ ] Switch the default UI to the new shell and delete the legacy `draw()` path.
- [ ] Sync `apps/desktop/tui/Cargo.toml` from `0.62.10` to the product version.
- [ ] Add `cli:test` and `cli:theme` scripts.

### Mobile multi-host (local only)

- [x] Per-host credential store (`zollybot.mobile.paired-hosts.v1`) with migration from the single session.
- [x] “Pair another computer” flow in Add Server, without replacing the active host.
- [x] One directory client per paired host.
- [x] Aggregate all paired hosts into the server list.
- [x] Isolate a 401 to one host instead of signing out the whole app.
- [x] Switch active host when its credential is removed.
- [x] Per-host forget/remove; cache cleanup still follows the active session.
- [ ] Tests: 2+ local hosts, offline host, revoked host, Tailscale reconnect.
- [ ] Manual two-host Tailscale matrix.

### Mobile release

- [ ] Bump the mobile version for the LFM, approval-status, and 401 fixes; add release notes.
- [ ] Publish an Android APK containing the recent mobile fixes.
- [ ] Verify the `v0.65.4` Android asset and its SHA-256.

### Desktop release

- [ ] Verify all `v0.65.4` desktop assets and updater manifests.
- [ ] Fix iOS build credentials for non-interactive EAS builds.

## Implemented references

- LFM model family chips and default LFM search in Jarvis local models.
- “Waiting for approval” / “Approved” connect notices.
- Session-wide 401 recovery returning the phone to Connect.
- Local `zollybot-cli` install and repaired `zollybot` desktop launcher.
