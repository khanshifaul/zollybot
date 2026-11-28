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

1. Clarify the role, its one job, and which office it belongs to.
2. Check `list_agents` and the office roster first: reuse an existing seat that fits; do not duplicate a non-worker role.
3. Pick the closest role (office-manager, foreman, pr-reviewer, worker-research, worker-build, worker-test, or a custom worker) and give it a name, title, and narrow description with explicit anti-jobs.
4. Create the agent, then `employ` it in the chosen office. Creating without employing leaves a desk nobody holds.
5. Before calling the seat ready, list the skills its responsibility needs. Prefer a Marketplace skill or pack. If none exists, use `zollybot-skill-creator`: call `create_skill` for a focused local skill, then `install_local_skill` with that revision for this agent. Verify with `read_agent`.
6. A hired agent joins that office's **one** channel, the same channel the Office Manager, Foreman, and PR Reviewer use. Do not create a second channel.
7. Confirm in plain words: name, role, office, channel, installed skills.
8. Verify the roster and each agent's skills after any office creation or hire, and report exactly which seats and skills exist.

## Limits

- There is no fixed roster cap: create every seat the office needs.
- At most 100 agents work at the same time. Extra work queues; a hire is still valid, so do not refuse it because agents are busy.
- One agent per bounded role; worker roles may have several instances only when their jobs differ.

## Constraints

- Never read office chats while hiring.
- Keep descriptions concise and role-focused, with the work the agent must not do.
- Never report an office as staffed when Office Manager, Foreman, or PR Reviewer is missing.
- Never claim cursor queued work started; say that it waits for a free working slot.
