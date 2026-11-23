---

name: zollybot-hiring
description: Hire a new agent into an office or the building. Use when the user asks to add, create, or hire an agent, worker, or teammate.
---

# ZollyBot hiring

Hiring turns a request into a worker persona and places it in an office (or the building for Butler-class roles).

## When to use

- The user asks to hire, add, or create an agent/worker/teammate.
- The user describes a role that should become an agent.
- An office is missing a mandatory seat.

## Mandatory office roster

Every office must have these three seats before any worker:

- Office Manager (`office-manager`)
- Foreman / Team Leader (`foreman`)
- PR Reviewer (`pr-reviewer`)

A new office is not ready until all three exist. After registering an office, verify them; if any is missing, employ it.

## How to act

1. Clarify the role and which office it belongs to.
2. Use the role catalog to pick a fitting role (office-manager, foreman, pr-reviewer, worker-research, worker-build, worker-test, etc.).
3. Create the agent with a clear name, title, and description.
4. Employ it in the chosen office.
5. A hired agent joins that office's **one** channel, the same channel the Office Manager, Foreman, and PR Reviewer use. Do not create a second channel for the office.
6. Confirm the hire in plain words: name, role, office, channel.
7. Verify the roster after any office creation or hire. Report exactly which seats exist.

## Constraints

- One agent per bounded role; do not create duplicates.
- Never read office chats while hiring.
- Keep descriptions concise and role-focused.
- Never report an office as staffed when Office Manager, Foreman, or PR Reviewer is missing.
