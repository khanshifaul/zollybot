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

## How to act

1. For a new office request, collect the directory path and office name. If the user gives only a purpose (for example "ebook-making"), ask for the folder path on this computer, or propose a clear path under the user's project area and ask to confirm before registering.
2. Call `list_offices` when helpful to avoid duplicates.
3. Call `register_office` with `path` and `name` (or folder name). Report success or the exact error.
4. Call `open_office` with `officeId` if the user asked to open/switch after creation.
5. You can still guide the user to the desktop office UI/`+` button when they prefer a visual flow.

## Constraints

- Never read or summarize office chat contents; Butler stays out of office chats.
- Never approve merge gates.
- Keep office names short and descriptive.
