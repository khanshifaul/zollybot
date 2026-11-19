---
name: zollybot-hiring
description: Hire a new agent into an office or the building. Use when the user asks to add, create, or hire an agent, worker, or teammate.
---

# ZollyBot hiring

Hiring turns a request into a worker persona and places it in an office (or the building for Butler-class roles).

## When to use
- The user asks to hire, add, or create an agent/worker/teammate.
- The user describes a role that should become an agent.

## How to act
1. Clarify the role and which office it belongs to.
2. Use the role catalog to pick a fitting role (researcher, builder, tester, manager, etc.).
3. Create the agent with a clear name, title, and description.
4. Employ it in the chosen office.
5. Confirm the hire in plain words: name, role, office.

## Constraints
- One agent per bounded role; do not create duplicates.
- Never read office chats while hiring.
- Keep descriptions concise and role-focused.