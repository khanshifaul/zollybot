# Set up a development environment

## Requirements

| Tool | Version | Notes |
| --- | --- | --- |
| Bun | 1.4.2, exact | The development scripts refuse another version. |
| Node.js | 24 or later | The `engines` field in `package.json` requires it. |
| Git | a current release | Worktrees, hooks, and release scripts use it. |
| Rust and Cargo | optional | Needed only for the Rust terminal client. |
| Xcode or Android Studio | optional | Needed only for a mobile build or a simulator. |

Use a graphical desktop session. The development command starts Electron. A headless shell can run
tests and type checks, but not the app window.

## First run

```sh
git clone https://github.com/khanshifaul/zollybot.git
cd zollybot
bun install --frozen-lockfile
bun run dev
```

`bun install` runs the package hooks. `postinstall` restores or downloads the Electron binary and
writes an install stamp. `prepare` installs the Git hooks in `.githooks/`.

`bun run dev` prepares the worktree and then starts the stack:

1. It copies the files named in `.worktreeinclude` from the main checkout.
2. It creates `.zollybot/dev-state.json` with a stable local identity when the file is missing.
3. It runs `bun install --frozen-lockfile` again only when the install stamp is stale.
4. It applies the local D1 migrations to `apps/auth-api/.wrangler/state/`.
5. It seeds the app profile only when that profile is missing.

Basic desktop development needs no `.env` file. The account Worker starts with generated local
defaults when `DOTENV_PRIVATE_KEY_DEV` is not set. Optional services need keys. See
[Optional services](#optional-services).

## What `bun run dev` starts

| Service | Default port | Notes |
| --- | --- | --- |
| Account API (`apps/auth-api`) | 3100 | Local D1. The web client is at `/app`. |
| Signal (`remote/api`) | 3101 | SDP, ICE, TURN credentials, and relay ingress. Health on 3102. |
| Desktop app (Electron and Vite) | 5173 | Renderer HMR. Chrome DevTools protocol on 9333. |
| Test client (`dev:test-client`) | 5174 | A second isolated client. Debug port 9334. |

The stack allocates ports through the registry in `scripts/dev-automation/stack-registry.ts`. A
busy default port moves the service. Read the URLs that the supervisor prints. Do not hardcode a
port.

The stack also writes a record for the worktree. Every other development command reads that record.
Do not start a second Electron window by hand.

## State and artifacts

| Path | Contents |
| --- | --- |
| `.zollybot/dev-state.json` | Local development identity and saved overrides. Git ignores it. |
| `.zollybot-build/` | Test, screenshot, CPU, and memory artifacts. Git ignores it. |
| `<userData>/zollybot.db` | The application database for the open profile. |
| `~/ZollyBot/Agents/<id>` | The workspace of one agent. |
| `~/ZollyBot/Shared/Data/agent-data.db` | The tables that agents create for themselves. |
| Platform configuration directory | Development profiles and the stack registry. `bun run dev:status` prints the registry path. |

## Daily commands

| Command | Use |
| --- | --- |
| `bun run dev` | Start the stack for this worktree. |
| `bun run dev:api` | Start only the account API. |
| `bun run dev:all` | Start the API, Signal, and one Electron instance. |
| `bun run dev:test-client` | Start a second client for team and remote checks. |
| `bun run dev:status` | Print every live stack, port, and pid as JSON. |
| `bun run dev:stop` | Stop this worktree's stack. |
| `bun run dev:forget` | Remove a stack record that `dev:stop` cannot resolve. |
| `bun run dev:seed` | Replace the app profile with showcase data. |
| `bun run dev:reset` | Delete the local app and host state. |
| `bun run dev:verify` | Print the checks and commands for the current changes. |
| `bun run dev:automation` | Drive the running app over CDP. |
| `bun run storybook` | Start Storybook for shared UI. |
| `bun run mobile:go` | Start the mobile app in Expo Go. |
| `bun run dev:mobile` | Start the stack, build the iOS app, and pair it. |

Never kill a process by pattern. `pkill -f electron` or `pkill -f bun` also stops other worktrees.
Use `bun run dev:stop`, `bun run dev:stop --pid=<supervisor pid>`, or `bun run dev:stop --all`.

## Worktrees

Each worktree has its own profile and its own ports. `.worktreeinclude` copies
`.zollybot/dev-state.json` and `remote/.env.keys` from the main checkout on the first start. An
existing file is never replaced.

A stack belongs to the worktree that started it. `bun run dev` refuses a second stack in the same
worktree unless you pass `--force`. `--shared` opens the shared `ZollyBot Dev` profile instead of a
profile keyed to the worktree path.

## Optional services

| Need | Action |
| --- | --- |
| Shared development secrets and Stripe sandbox | Set `DOTENV_PRIVATE_KEY_DEV` in the shell. See [account service setup](../../apps/auth-api/README.md). |
| Slack events | Run `bun run dev:slack`. It reads `ZOLLYBOT_DEV_SLACK_SIGNING_SECRET` from `.env.slack-dev` or the shell, and needs `SLACK_ROUTE_PRIVATE_JWK` and `SLACK_ROUTE_KEY_ID`. |
| iPhone Live Activity | Run `bun run dev:apns-key -- <AuthKey_ID.p8> [KEY_ID]`, then restart the stack. |
| A real hosted server from a development build | Run `bun run dev --hosting=test`. It signs in to the test account Worker. |
| Web client only | Run `bun run dev:api` and open `/app` on the printed API URL. |

Do not print a secret. Do not run `dotenvx get` or `echo` on a token. The production key file is
the root `.env.keys`. A worktree does not copy it.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| `Unsupported Bun <version>` | Install stable Bun 1.4.2. |
| `This worktree already runs a dev stack` | Reuse that stack, stop it, or pass `--force` after you confirm the stack is yours. |
| A default port is in use | Let the registry choose another port. Read the printed URL. |
| `dev:stop` exits non-zero and names a pid | Check that process yourself. If it is gone, run `bun run dev:forget`. Do not kill by pattern. |
| The app window is blank | Run `bun run dev:automation -- instances` and `bun run dev:status`. Read the supervisor output. |
| The local D1 database is empty | Run `bun run api:migrate:local`. |
| Metro reports that its port is in use | Stop the other worktree's Metro. Two worktrees must not serve one app id. |
| Electron does not open | Confirm that a graphical session and a display are available. |

## First verification

After the app opens:

1. Send a message in an agent chat and wait for the answer.
2. Run `bun run dev:automation -- snapshot` and confirm that it prints the window tree.
3. Run `bun run storybook` and open one shared UI story.

If one of these steps fails, read [Troubleshooting](../TROUBLESHOOTING.md) before you change code.
Report the blocker. Do not replace the development app with a packaged build.
