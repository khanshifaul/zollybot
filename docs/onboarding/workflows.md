# Workflows

This page gives the day-to-day loop and recipes for common changes. The root
[repository instructions](../../AGENTS.md) are the authority. Read the `AGENTS.md` file in the
directory you change before you edit.

## Daily loop

1. Create a branch from `main`.
2. Change one concern. Read the owner instructions for the files you touch.
3. Run the narrow check for the changed files.
4. Run the affected test file, or drive the changed surface in the dev app.
5. Commit. The pre-commit hook runs the staged checks.
6. Open a pull request. Add a `changelog.d/` note when a user can see the change.

Use narrow checks. CI runs the full lint, the full test shards, the builds, and the package
verification. Do not run the aggregate `bun run check`, the aggregate `bun run typecheck`, the
mobile typecheck, or a full build as a routine step. See [Checks](../../AGENTS.md#checks).

## Checks

| Check | Command | Scope |
| --- | --- | --- |
| Format and lint one file set | `bunx biome check --write --max-diagnostics=none <paths>` | The named files only. Do not run `bun run format`. |
| Main, preload, backend, scripts | `bun run typecheck:node` | One project, about 10 seconds. |
| Renderer and shared UI | `bun run typecheck:renderer` | One project. |
| One workspace | `<workspace> typecheck`, such as `bun run --cwd packages/contracts typecheck` | The named workspace. |
| Tests of changed files | `bun run test:changed` | One worker. Uses `origin/main`. |
| Tests of named sources | `bun run test:related -- <source>` | The test files that import the source. |
| One desktop test file | `bun run test:desktop -- <path>` | One Vitest file. |
| Account API tests | `bun run test:api` | The Worker test project. |
| Doc links | `bun run check:doc-links` | Every tracked Markdown file. |
| Translation catalogs | `bun run i18n:check` | Keys, placeholders, plurals, and unused keys. |
| Schema parity | `bun run test:desktop -- src/backend/zollybot-database-schema-parity.test.ts` | New installs against migrated installs. |

The pre-commit hook runs `check:staged`, `check:ui`, and the typecheck of every project that can
see a staged file. It also runs the schema parity test when a schema file is staged. Do not bypass
the hook with `--no-verify`. Do not run those checks by hand.

`bun run check:ui` budgets are at zero. Do not run it by hand and do not raise a budget. If it
fails, change the UI to use the shared primitive or the design token.

## Recipes

### Add an IPC endpoint

1. Add the endpoint to a group in `packages/contracts/src/ipc-endpoints.ts`:

   ```ts
   request<Payload, Result>()("group:wire-name")
   event<Payload>()("group:wire-name")
   ```

2. Add the handler in `src/main/ipc/<domain>-handlers.ts`. Use `payloadHandler(decode, handler)`
   and a decoder from the domain `*-inputs.ts` file. Do not bind a raw `unknown` payload.
3. If the group uses `bridgeGroup`, add the result decoder to the group's decoder map in
   `src/preload/index.ts`. If the group is hand-written, add the `invokeAgentForServer` or `listen`
   call and declare the `ZollyBotDesktopApi` method as `Invoke<...>` or `Subscribe<...>`.
4. Add the method to `src/renderer/src/preview/mock-zollybot.ts`, or to the `mock-*.ts` module that
   owns the group.
5. Run `bun run typecheck:node` and `bun run typecheck:renderer`. The errors name each missing
   piece.
6. Run `bun run test:desktop -- src/main/ipc-channel-coverage.test.ts`.

Read [IPC binding rules](../../src/main/ipc/AGENTS.md#adding-an-endpoint) for the five handler
forms and the routing helpers.

### Add a renderer feature

1. Create `src/renderer/src/features/<domain>/`.
2. Add `<domain>-context.tsx` with the provider and its `use*()` pair. Add `<domain>-port.ts` with
   only the bridge calls this domain makes.
3. Add the views in `<Domain>*.tsx` and the DOM-free logic in `<domain>-*.ts`.
4. Add `<domain>.css` and import it from `styles.css` in the existing cascade order.
5. Add the provider to `app-providers.tsx`. Put per-server state inside `ScopedProviders`; put
   everything else above it.
6. Read state from the smallest component that needs it. Do not assemble another feature's props
   in a shell.
7. Run `bun run typecheck:renderer`, then drive the screen in the dev app. The pre-commit hook
   runs `check:ui`.

Copy the structure of an existing feature. `features/conversation` and `features/agents` are
representative.

### Add or change shared UI

1. Search `packages/ui/src` first. Extend an existing primitive or feature component.
2. Add a feature component under `packages/ui/src/features/<domain>/` and export an explicit
   subpath from `packages/ui/package.json`.
3. Pass data and actions through typed props and callbacks. Do not import renderer, main, backend,
   preload, or `window.zollybot`.
4. Use `useText()` from `@zollybot/ui/text` for interface text.
5. Add or update a story in `src/renderer/stories/`. Do not add a `play` function.
6. Check the desktop, web client, preview, and Storybook consumers.

Do not copy a component back into the renderer. Move it. Preserve the markup, styles, and behavior
unless a design change is requested.

### Add interface text

1. Add the key to the English area module in `packages/i18n/src/messages/en/`.
2. Use `useText()` in the renderer and shared UI, `currentText()` in mobile code outside React, and
   `sourceText` in main, backend, and the team client.
3. Add translations, or add the locale to `packages/i18n/untranslated.json`.
4. Run `bun run i18n:check`.

The English of an `error.*` or `status.*` source key is a wire value. Do not change it. See
[Interface text and languages](../i18n.md#text-from-another-process).

### Change the SQLite schema

1. Append the next contiguous migration in `src/backend/zollybot-database-schema.ts`. Never edit a
   migration that may have shipped, including the version 8 baseline.
2. Mirror the same DDL in `LATEST_SCHEMA_SQL` for new databases.
3. Add the version to `zollybot-database-schema-history.json`. The parity test prints the entry to
   add.
4. Add migration fixtures for every affected released schema, plus failure, rollback, retry,
   downgrade, missing-version, foreign-key, and integrity cases.
5. Run the parity test and the migration tests.

A migration is an irreversible production data operation. No backup exists. Read
[Database migrations](../../src/backend/AGENTS.md#database-migrations) and
[Change rules](../architecture/change-rules.md#change-rules).

### Add a provider, MCP app, or connector

Read [Add a provider](../architecture/integrations.md#add-a-provider),
[Add an application](../architecture/integrations.md#add-an-application), or
[Add a connector](../architecture/integrations.md#add-a-connector). Register the adapter in
`src/backend/provider-drivers.ts`. Keep vendor payloads in the adapter. Add a conformance or fake
provider test when the protocol changes.

### Add a role or an office behavior

Read [offices implementation](../plans/2026-11-08-offices-implementation.md). Add a built-in role to
`src/backend/offices/role-catalog.ts`. Use `src/backend/offices/office-catalog.ts` for discovery and
`office-store.ts` for persistence. Add the control-socket route in `src/main/server-mode.ts` when
the terminal must see it. Add the desktop surface under `src/renderer/src/features/offices/`.

Do not copy office briefs, results, or memory into `zollybot.db`. The office owns its `.agents/`
content.

## Tests

Most tests are E2E scripts under `scripts/`. Run the script for the feature. A script writes a JSON
report or a screenshot under `.zollybot-build/`.

Vitest files are reserved for the protected areas in [Tests](../../AGENTS.md#tests): database
migrations, the renderer-to-main trust boundary, secret redaction, and the lint and UI rule
fixtures. The account Worker has Vitest migration, network-access, and log-redaction tests. Check
the owner instructions before you add a new Vitest file.

| Rule | Reason |
| --- | --- |
| Wait for a state, an event, or a promise. | A fixed delay becomes a flaky test under load. |
| Assert behavior and data. | Markup, classes, layout, and animation timing are not contracts. |
| Use `findByRole` or `findByText` as the wait. | A manual wait followed by `getBy*` has a worse failure message. |
| Do not raise a timeout to make a test pass. | Find the barrier instead. |
| Write the failure modes before a new Vitest file. | The pull request asks for one line per failure and its test. |

## Debug the running app

Start the stack once. Then drive the window that is already open.

```sh
bun run dev:automation -- instances
bun run dev:automation -- pages
bun run dev:automation -- snapshot
bun run dev:automation -- screenshot --out=before.png
bun run dev:automation -- click --role=button --name="Send" --allow-mutations
bun run dev:automation -- type --role=textbox --name="Message" --text="Hello" --submit --allow-mutations
bun run dev:automation -- click --role=button --name="Send" --allow-mutations --wait-for=button,Stop
```

Rules:

- Read-only commands need no flag. `click` and `type` need `--allow-mutations` and a named instance.
- `--page=<target-id|url-substring>` aims at another window, including an embedded browser view.
- The tool never seeds, resets, or copies `zollybot.db`.
- Do not launch a second Electron instance and do not drive another worktree's app.
- Use `bun run dev:status` to see every stack, port, and pid.
- Use `bun run dev:verify` to print the checks and commands for the current changes. Add `--run`
  to run only the safe, non-mutating checks.

For a UI change, take a before screenshot, make the change, reload the window, and take an after
screenshot. Report what you saw.

## Commit and pull request

1. Confirm that the change is one you can send. A bug fix, a small alignment, a translation, or a
   documentation change needs no issue. A new feature or a behavior change needs an issue with the
   `approved` label. See [What you can send](../../CONTRIBUTING.md#what-you-can-send).
2. Commit on a branch from `main`. Do not bypass the hook.
3. Add `changelog.d/<branch>.md` for a user-visible change. Use `-` for `/` in the branch name.
   A change that no user can see gets the `no-changelog` label. See
   [Release notes](../RELEASING.md#release-notes).
4. Open the pull request with the template. Name the surfaces you touched, the verification you
   ran, and the risk.
5. Answer the NorbiAI review. A P0 or P1 finding blocks the merge. Fix it, or give a checkable
   rebuttal and include `/norbiai review` in the same comment.
6. External authors sign the CLA. Organization members and users with write access do not sign.

Do not commit generated output, real conversations, user files, credentials, or screenshots. Put a
before and after screenshot in the pull request body.

## Release

```sh
bun run release:preflight
bun run release:patch     # or release:minor, release:major
```

The release command moves every `changelog.d/` note into the new section of `CHANGELOG.md`, in merge
order, and deletes the note files. Read [Releasing](../RELEASING.md#release-notes) before a version
bump. A tag release builds and signs the packages in CI. The phone app has a separate release.

## Avoid

| Do not | Do instead |
| --- | --- |
| `console.log` | `@zollybot/logging` with the redacting logger. |
| A literal that a user reads | An `@zollybot/i18n` key. |
| `window.zollybot` in a view or context | A domain `*-port.ts` function. |
| Edit a shipped migration | Append a new migration and update the latest schema. |
| Change the meaning of a released field | Add a protocol version or a capability. |
| Add a second linter or formatter | Biome and its GritQL rules. |
| Widen a boundary to `any` or `unknown` | Fix the domain type, or ask the developer. |
| Add `biome-ignore` or `@ts-expect-error` | Remove it. If it is truly necessary, name the reason in the pull request and let a reviewer decide. |
| Copy a shared component into an app | Move or extend it in `packages/ui`. |
| Kill a process by name | `bun run dev:stop` or a pid you started. |
| Run the full test suite before a pull request | Run the narrow checks. CI owns the suite. |
