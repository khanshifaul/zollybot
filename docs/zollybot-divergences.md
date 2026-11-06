# ZollyBot ↔ OpenBot: the divergence register

ZollyBot started as OpenBot (`nightly-labs/openbot`). The runtime is shared; the
identity, hosting, distribution and several behaviour choices are not. This file
is the list of those differences, so a later change does not silently drift back
to upstream defaults. Add a row when a new divergence appears; remove a row only
when the fork rejoins upstream on that point.

Upstream README is kept untouched at `README.upstream.md`, and attribution stays in
`NOTICE` and `LICENSE`.

| Area | OpenBot (upstream) | ZollyBot (this fork) | Evidence |
|---|---|---|---|
| Product identity | OpenBot | ZollyBot, `app.zollybot.desktop`, scheme `zollybot` | `electron-builder.yml`, `package.json` |
| Web + API hosts | `openbot.run` | `zollybot.shifaul.dev`, `api-zollybot.shifaul.dev` | `electron-builder.yml`, `site/` |
| Sign-in email | upstream account service | our auth-api, Resend, sender `hello@zollybot.shifaul.dev` | `apps/auth-api/src/server/email-delivery.ts`, `wrangler.jsonc` |
| Update feed | GitHub Releases (`nightly-labs/openbot`) | `https://zollybot.shifaul.dev/releases/<version>` | `electron-builder.yml` |
| Release assets | upstream names | every artifact carries its version (`zollybot-linux-x86_64-0.62.2.tar.gz`, …) | `scripts/publish-release.sh`, `site/install.sh` |
| Linux install | AppImage from GitHub Releases | files: `.tar.gz` unpacks to `<prefix>/lib/zollybot`, launcher linked | `site/install.sh` |
| Distribution | GitHub Releases, Docker, Nix | own release host, installer script, arm64 APK | `site/`, `scripts/publish-release.sh` |
| Terminal frontend | `openbot login` for servers | `zollybot-cli` TUI: agents list, sign-in, pairing QR, over the server control socket | `crates/zollybot-cli/src/main.rs` |
| Terminal data | server CLI only | `GET /v1/agents` from the app's own agent store — not a second product | `src/main/server-mode.ts` |
| Office layer | none | `.agents/` tree: Zolly manager, foreman, reviewer, memory, queue, rules | `.agents/` in the project template |
| Default agents | none | seeded office agents are intended: Zolly, Foreman, HR, PR Reviewer, workers | `src/backend/agent-service.ts` (seeding) |
| Mobile app | upstream store builds | arm64 APK published with each release | `apps/mobile`, `scripts/publish-release.sh` |

## Rebranding rules that follow from this

- Do not reintroduce upstream hosts, package names or release URLs. CI and the
  desktop build carry our values; a diff that adds `openbot` is a bug unless it
  is attribution in `README.upstream.md`, `NOTICE` or a changelog history line.
- The `zollybot` scheme, app id and desktop name are part of the contract with
  the installed app and with `zollybot://mobile-connect` QR codes.
- The office layer (`.agents/`) belongs to the project template, not to the
  ZollyBot app. The app's terminal frontend shows the app's agents; it does not
  read `.agents/`.
