---

name: zollybot-office-setup
description: Inspect an office repository and record the tools and commands it needs. Use on the first task in an office, or when the toolchain is unknown.
---

# ZollyBot office setup

An Office Manager opens an office by learning how to build and verify it. Do this before the first product task, then keep the facts in office memory.

## When to use

- A new office was just registered or opened.
- The first task arrives in an office with no setup brief.
- A task fails because a tool, dependency, or command is missing.

## How to act

1. Read the repository manifests it has: `package.json`, `bun.lock`/`bun.lockb`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `pyproject.toml`, `requirements.txt`, `Cargo.toml`, `go.mod`, `Makefile`, `justfile`, `composer.json`, `Gemfile`.
2. Detect the toolchain and the package manager.
3. Detect the real commands for install, test, lint, typecheck, and build. Do not guess: read the scripts and config.
4. Install or verify dependencies when it is local and safe. Never install globally, never run destructive commands, and ask before a network install or a long build.
5. Record what you found in office memory: toolchain, package manager, commands, and any blocker. Keep each fact short.
6. Write a short setup brief: what the office builds, how to verify it, and what is missing.
7. Keep the gate list: review gate and human gate.

## Constraints

- Do not write product code.
- Do not start workers before the setup brief exists.
- A missing tool is a blocker, not a guess.
- Never read office chats; you are one of its agents.
