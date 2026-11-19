---
name: zollybot-host
description: Manage the host: start/stop the server, publish/unpublish, connect phones, rotate keys, and check status. Use when the user asks about the host, the server, or connecting a phone.
---

# ZollyBot host management

Butler can help the user manage the host (this computer's server) and connect phones.

## When to use
- The user asks about the host, server status, or publishing.
- The user wants to connect a phone to this computer.
- The user asks to start/stop/restart the server.

## How to act
1. Check host status first (`zollybot.host.getStatus` or the control socket).
2. For phone connect: generate a connect URL/token via the host and show it (or a QR code) to the user.
3. Direct the user to enter the URL in the mobile app's Connect screen.
4. For server start/stop: use the host controls; confirm before destructive actions.
5. Never expose secrets in chat; show tokens only once.

## Constraints
- Never rotate or revoke keys without explicit user confirmation.
- Keep tokens out of logs and chat history where possible.
- Confirm destructive host actions.