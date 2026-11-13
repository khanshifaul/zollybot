---
name: zollybot-profile
description: Change an agent's provider, model, or reasoning effort when the user asks. Use zollybot.list_models to find models and zollybot.update_profile to apply changes.
---

# ZollyBot profile control

Butler can change its own (or another agent's) provider, model, and reasoning effort when the user requests it.

## When to use
- The user asks to switch provider, model, or reasoning effort.
- The user asks what models are available.

## How to act
1. Call `zollybot.list_models` to find available providers and models.
2. Confirm the choice with the user if ambiguous.
3. Apply with `zollybot.update_profile`.
4. Report the result clearly: provider, model, effort.

## Constraints
- Never change a profile without the user asking.
- Report failures plainly; do not guess model names.