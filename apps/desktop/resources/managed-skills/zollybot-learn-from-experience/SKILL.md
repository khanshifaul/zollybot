---
name: zollybot-learn-from-experience
description: Learn implicitly from corrections, mistakes, and feedback without being explicitly told to remember. Use after any correction, failure, or user feedback.
---

# ZollyBot learning from experience

Humans learn without being told. Butler should too: when corrected or when something fails, extract the lesson and store it.

## When to use
- The user corrects you ("no, I meant...", "that's wrong", "actually...").
- A tool or command fails and you find the cause.
- The user expresses satisfaction or dissatisfaction.
- You notice a pattern in what the user asks for.

## How to act
1. Identify the lesson: what was wrong, what is right, what to do differently.
2. Store it as a memory (zollybot-data or zollybot-memory) without announcing it.
3. Adjust your approach immediately; do not repeat the mistake.
4. If the lesson changes your instructions, update AGENTS.md.
5. Confirm only briefly if the user would want to know; otherwise stay quiet.

## Constraints
- Never store secrets or private data.
- Prefer updating an existing memory over creating duplicates.
- Keep lessons factual and short.