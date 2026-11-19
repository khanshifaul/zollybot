# ZollyBot Telegram bot

The one ZollyBot Telegram bot, `@meetZollyBot` (bot ID `8630107594`). The ZollyBot app links a chat
with a one-use `t.me` link, and the chat is linked to the ZollyBot server that made the link. People
mention the bot in a group, reply to it, or send it a direct message, and the Telegram Orchestrator
agent on that ZollyBot server asks the right agent and answers. No code runs here: this file lists the
settings of the bot in @BotFather.

Only Signal (`remote/api`) has the bot token. Telegram posts each update to Signal, and Signal makes
each Bot API call for the hosts. The account Worker (`account service`) has only the bot ID and the
username. Hosts have no Telegram secret.

## BotFather settings

Make the bot with `/newbot` in [@BotFather](https://t.me/BotFather), and copy the token once.

- **Privacy mode** (`/setprivacy`): Disable. With privacy mode on, Telegram does not send a plain
  `@meetZollyBot` mention to a bot that is not an admin of the group, so only replies work there.
  With it off, Telegram sends the bot every message of the group. ZollyBot answers only a mention, a
  reply to the bot, or a message of a reply chain that an agent answers. A group must remove the bot
  and add it again before the new setting applies. An admin bot gets every message in both cases.
- **Allow groups**: keep it on (the default).
- **Commands**: set none. `/start` is only the link from the ZollyBot app, and `stop` is a word or a
  button, not a command.
- **Profile photo** (`/setuserpic`): a square image of 512×512 or more, with a solid background.
  Telegram stores it as JPEG, so a transparent background becomes black. Telegram shows it in a
  circle: keep the logo in the center.
- **Name** (`/setname`):

  ```
  ZollyBot
  ```

- **About** (`/setabouttext`, at most 120 characters):

  ```
  Your ZollyBot AI teammates in Telegram. Mention @meetZollyBot in a group or send a direct message to delegate work.
  ```

- **Description** (`/setdescription`, at most 512 characters). Telegram shows it in an empty chat:

  ```
  ZollyBot brings your AI teammates into Telegram.

  Mention @meetZollyBot in a group, reply to it, or send it a direct message to delegate work, follow progress, and get results without leaving the chat.

  Your AI teammates run in your own ZollyBot workspace, with distinct roles, instructions, and context. Use them for research, writing, planning, summaries, and daily work. When an action needs approval, ZollyBot asks first.

  To start, connect Telegram in the ZollyBot app: Marketplace → Apps → Telegram.
  ```

Do not set a webhook by hand. Signal sets it when it starts.

## Secrets

| Where | Name | Value |
| --- | --- | --- |
| Worker | `TELEGRAM_BOT_ID` | The part of the token before `:`. Never the token. |
| Worker | `TELEGRAM_BOT_USERNAME` | The username, without `@`. |
| Worker | `SLACK_ROUTE_PRIVATE_JWK`, `SLACK_ROUTE_KEY_ID` | The Slack route key. It signs the Telegram route tickets too. |
| Signal | `TELEGRAM_BOT_TOKENS` | The bot token, `<bot ID>:<secret>`. Comma-separated for more than one bot. |
| Signal | `TELEGRAM_WEBHOOK_SECRET` | A random value of at least 32 bytes. Signal derives the webhook secret of each bot from it. |
| Signal | `TELEGRAM_WEBHOOK_ORIGIN` | `https://signal-zollybot.shifaul.dev`. Signal sets each bot's webhook to `<origin>/v1/telegram/updates/<bot ID>`. |

The Worker values are in the encrypted `production environment configuration` and `.env.dev`, and the Signal
values in the encrypted `remote/.env.production`. `scripts/deploy-account service.ts` (`bun run api:deploy`)
sets the Worker values. Without them, the Telegram routes answer 503 `telegram_not_configured`.

Production and development use the same bot now. A bot has one webhook, so a local test (see
[docs/messaging.md](../../docs/messaging.md#test-telegram-locally)) moves the webhook from
production. A production Signal sets it back when it starts.

To check the webhook:

```sh
curl -s "https://api.telegram.org/bot<token>/getWebhookInfo"
```

## Limits of Telegram

- With privacy mode on, a plain mention does not reach a bot that is not an admin of the group.
  Only replies to the bot and commands do. This is why privacy mode is off.
- A basic group has no reply threads. ZollyBot keeps the reply chain in memory, so after a restart an
  older chain needs a mention or a reply to the bot.
- A group has no private message. When a person who is not the requester presses an approval button,
  the bot answers in the chat.
- A bot can send and receive files of at most 20 MB.
- Telegram does not send an update again. An update that comes while the host is offline is lost.
