---

name: zollybot-offices
description: Create, open, and manage offices in the ZollyBot building. Use when the user asks to start a new office, open an existing office, or list offices.
---

# ZollyBot offices

An office is a scoped workspace for a team of agents. Butler knows every office and can create, open, or list offices with chat tools.

## When to use

- The user wants to start a new project or workstream.
- The user asks to open or switch to an office.
- The user asks what offices exist.

## Tools

- `list_offices`: show registered and discovered offices.
- `register_office`: register a directory as an office. Needs `path` (directory on this computer). Optional `name`.
- `open_office`: mark an office opened by `officeId`.
- `list_channels`, `create_channel`, `update_channel`, `send_to_channel`: office channel.

## Ask before you register

Never invent a path. If the user did not give one, ask one short question and wait:

> Do you have an existing folder or repository for this office, or should I create a new one? Give me the absolute path.

When the user answers:

- **Existing folder or repository**: use that absolute path. Check whether it already has `.agents/zolly/config.toml`.
  - If it has the marker, it is an existing office. Register or open it.
  - If it has no marker, ask: "This folder is not an office yet. Should I initialize it as one?" Register only after the user agrees; registration writes the marker.
- **New office**: propose a path under `~/Projects/<name>` and ask the user to confirm it. Do not create or register it until they confirm.

## Office channel: one per office

Each office has exactly **one** channel, named after the office.

- **Lead**: the Office Manager.
- **Members**: Office Manager, Foreman (team leader), PR Reviewer, and every worker employed in that office.
- **New agents join the same channel.** Do not create a second channel for the same office.
- Registration creates the channel and adds the mandatory roster. Verify it with `list_channels`; if it is missing, create it or add the missing members.
- Channel purpose: the shared brief, task ownership, results, review, and evidence. It is not a private DM.

## Where a task lands

A user task lands on **Butler or the Office Manager first**, never directly in a channel.

1. The user gives the task to Butler (building-level) or the Office Manager (office-level).
2. The manager triages it, writes the brief, records it in the ledger, and sets the gate.
3. The manager posts the brief into the office channel as a channel task, assigned to the Foreman or a worker.
   - **This is automatic**: when a task turn with the Office Manager completes, ZollyBot posts the manager's answer to the office channel and hands it to the Foreman. Do not send the same brief again with `send_to_channel`; that creates a duplicate.
4. Foreman/worker/PR Reviewer coordinate in that channel: assign, result, review, fix, merge.

Use `send_to_channel` only when the work already belongs to a channel and has a clear channel owner. Do not use the channel as an unowned inbox.

## How to act

1. Get the path and name as above.
2. Call `list_offices` to avoid duplicates.
3. Call `register_office` with the confirmed `path` and a short `name`.
4. **Registering also employs the mandatory roster**: Office Manager, Foreman (team leader), and PR Reviewer. Do not treat the office as ready until all three exist.
5. Verify with `list_offices` that the office reports its agents, and check the agent roster for the three roles. If a role is missing, employ it before reporting success.
6. Verify the office channel with `list_channels`: one channel named after the office, Office Manager as lead, all three seats as members. If it is missing, create it; if a seat is missing, add it.
7. The Office Manager then inspects the repository and records the tools and commands it needs (office setup). Do not start workers before that setup brief exists.
8. Call `open_office` with `officeId` if the user asked to open/switch after creation.
9. Report the office name, path, each mandatory seat, and the channel name. Never say "office created" when the roster is still empty.

## Constraints

- Never read or summarize office chat contents; Butler stays out of office chats.
- Never approve merge gates.
- Keep office names short and descriptive.
- Never register a path the user did not give or confirm.
- Never report an office as staffed until Office Manager, Foreman, and PR Reviewer exist.
- Never create a second channel for an office.
