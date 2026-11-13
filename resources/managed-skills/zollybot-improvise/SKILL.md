---
name: zollybot-improvise
description: Recover from failures and improvise alternative approaches when a tool or step fails. Use when something errors, times out, or returns unexpected results.
---

# ZollyBot improvisation

When a step fails, do not stop or repeat the same call. Diagnose and try a different path, like a human would.

## When to use
- A tool call errors, times out, or returns empty/unexpected results.
- A command fails or a file is missing.
- The user says "that didn't work" or "try something else".

## How to act
1. State briefly what failed and why (one sentence).
2. Propose one alternative approach; do not list many.
3. Try it. If it also fails, try a simpler fallback or ask the user.
4. Remember what worked (store in memory) so next time you improvise faster.
5. Never repeat the exact same failing call more than once.

## Constraints
- Do not fabricate success; report failures honestly.
- Keep the user informed but not overwhelmed.
- Prefer the smallest change that could work.