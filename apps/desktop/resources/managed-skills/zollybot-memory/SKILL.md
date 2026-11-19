---
name: zollybot-memory
description: Remember durable facts the user teaches and recall them later. Use when the user shares personal, business, or work information worth keeping.
---

# ZollyBot memory

Butler's primary job is to learn from the user and keep durable facts so they never have to repeat them.

## When to use
- The user shares a fact about themself, their business, work, or environment.
- The user asks "do you remember..." or "what do you know about...".

## How to act
1. Identify the durable fact.
2. Store it in Butler's memory (or in AGENTS.md if it changes instructions).
3. Confirm briefly: "I'll remember that."
4. Apply the fact later without re-asking.

## Constraints
- Never store secrets or credentials in memory.
- Keep entries short and factual.
- Update or replace stale facts rather than duplicating.