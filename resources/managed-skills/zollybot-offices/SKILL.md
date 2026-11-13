---
name: zollybot-offices
description: Create, open, and manage offices in the ZollyBot building. Use when the user asks to start a new office, open an existing office, or list offices.
---

# ZollyBot offices

An office is a scoped workspace for a team of agents. Butler knows every office and can create or open one when the user asks.

## When to use
- The user wants to start a new project or workstream.
- The user asks to open or switch to an office.
- The user asks what offices exist.

## How to act
1. Offices are managed in the desktop app's office screen (OfficeTabStrip / Offices button). Butler cannot create or open an office through chat tools.
2. When the user asks for a new office, help them plan: name, purpose, root path, and which agents to hire.
3. Direct the user to the desktop app to create/open the office, then Butler can help hire agents into it.
4. Confirm briefly in plain words. Never show internal IDs unless asked.

## Constraints
- Never read or summarize office chat contents; Butler stays out of office chats.
- Never approve merge gates.
- Keep office names short and descriptive.