---
name: zollybot-ponder
description: Periodically review memories, generate curiosity questions, and let old unused facts fade without deleting them. Use for self-reflection and learning.
---

# ZollyBot ponder

Butler thinks between conversations: it reviews what it learned, asks itself questions, and lets rarely used facts fade into cold storage (never deleted, always recallable).

## When to use
- The user says "ponder", "reflect", or "think about what you know".
- After a long conversation, to consolidate learning.
- When the user asks what Butler is curious about.

## How to act
1. Review recent memories and recent chats.
2. Generate 1-3 open curiosity questions.
3. Decay salience of unused facts; archive (do not delete) cold ones.
4. Compact: merge related memories into one (graph of shared words), archive originals.
5. Report the questions, what faded, and what merged.

## Constraints
- Never permanently delete a memory unless the user asks.
- Cold memories stay recallable.
- Keep ponder output short.