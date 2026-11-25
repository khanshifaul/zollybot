# Changelog

All notable changes to the ZollyBot iPhone app will be documented here. The project follows
[Semantic Versioning](https://semver.org/). Notes for the next release are in
[`changelog.d/`](changelog.d/README.md). The changes of the desktop app and the web client are in
the [root changelog](../../CHANGELOG.md).

## [Unreleased]

## [0.66.4] - 2026-11-25

### Fixed

- Composer send button, Return/Shift+Return behavior, right drawer button, and device actions without a local model.

## [0.66.3] - 2026-11-25

### Changed

- Removed the device-actions tile from the Jarvis composer; Jarvis executes device actions from conversation intent.

## [0.66.2] - 2026-11-25

### Added

- Local Jarvis memory, device time and location, vision-model switching, and attachment bubbles.
- Android default-assistant support.
- Contacts, direct calls, and SMS after a one-time permission grant.

### Fixed

- Draggable left and right sidebars, interactive Jarvis/Agents switch, and reconnect status below the topbar.

## [0.66.1] - 2026-11-25

### Changed

- Jarvis local mode uses QVAC only: chat, camera, photos, files, and screen context stay on the phone.
- Butler is contacted only when explicitly requested.

### Fixed

- Right-edge drag opens the Jarvis conversation sidebar.

## [0.64.6] - In review

### Changed

- Bump the app version to 0.64.6 for local debug and release builds.

## [0.64.5] - In review

### Added

- Jarvis voice assistant: "Hey Jarvis" wake word, hands-free Butler conversation, Voice match, and a Jarvis screen on the Android lock screen.
- QVAC local model screen for Qwen 3 0.6B on supported arm64 phones.
- Screen Context attaches a screenshot to Jarvis.
- Confirmed actions for apps, timers, dialer, messages, and phone settings.

### Fixed

- Group agents by office in the Agents tab.
## [0.64.3] - 2026-11-17

### Fixed

- Improve mobile connect pairing and recovery over Tailscale, MagicDNS, LAN, and bare IP addresses.
- Reduce account-loading hangs and show clearer connect and redeem errors.

## [1.4.8] - In review

### Changed

- Bump the app version to 1.4.8 (Android versionCode 2) for local debug and release builds.

## [1.4.7] - 2026-11-06 (iOS)

### Added

- The workflow editor shows Slack triggers and Slack outputs that you made on the desktop.
- Add lime and indigo to the agent colors. Agents that had lime show lime again, not green, and
  agents that had indigo show indigo, not violet.
- Agents can use more colors: sky blue, navy, pink, wine, brown, sand and gray. A server that keeps
  agent colors shows and saves the exact color. On an older server, the app saves the nearest hue.
- Use the app in Arabic. After a restart, the layout mirrors from right to left.
- Show each chat paragraph in the direction of its text, in all languages. Code blocks always read
  from left to right.
- In the workflow editor, a Condition step has a Model choice and an Effort choice, as an LLM step
  has.
- The agent's Runtime settings show the usage limit under the model when a spent plan window stops
  that model, with the time when the limit resets, as the desktop model picker does. The note uses
  the readings of the Usage screen and goes when the window resets.
- You can delete a message in a chat. Touch and hold the message, then select Delete. This works in
  agent chats, tasks and channels. The message goes from the chat for everyone. The agent can still
  remember it. You can delete your own messages. Admins, and members who can manage the agent, can
  delete any message. The server must have the latest version of ZollyBot.
- You can send the text of a message in an agent chat to a channel. Touch and hold the message,
  select Send to channel, then select the channel. The channel opens with the text in its composer.
- A task thread shows the name of each other member who wrote a message in it.
- Change the speed of a message that is read aloud: 0.75x, 1x, 1.25x, 1.5x or 2x. The speed button is
  in the Read aloud row of the message sheet. The voice keeps its pitch, and the speed also applies
  to voice conversations.
- Connect a Coinbase or Robinhood account from the Apps marketplace. Agents can read balances, positions and prices, and place orders.
- Connect RevenueCat from the Apps marketplace with a secret API key to manage products, offerings and paywalls, look up customers, and read revenue charts.
- Add Download to the Hermes Agent page of a server. The server runs the official Hermes installer
  and shows its progress. Then Connect signs in with the Nous Portal code.
- Connect TickTick from the Apps marketplace with browser sign-in to see and add tasks, organize lists and tags, and track habits and focus records.
- **Settings → Support** has a link to open a ticket on the ZollyBot Discord, the fastest way to get help.
- Add Mark unread to the actions of an agent's message. That message and the messages after it
  become unread, and the chat stays unread until you open it again. The server must have the
  latest version.
- Show a NEW line above the first unread message when you open an agent's chat, as on desktop.
  With chat colors on, the line has the agent's color. The line grows in from the NEW label.
- Owners and admins can add and change Telegram and Slack triggers and outputs in the workflow editor.
  Choose the chat, the Slack workspace and channel, the text filter, the action and the emoji, as on
  the desktop. The server must run a new ZollyBot version and have a linked Telegram chat or Slack
  workspace.
- Owners and admins can link and manage the WhatsApp numbers of a server from the phone. Link a
  number with a pairing code, add the WhatsApp Orchestrator, choose the contacts and groups that can
  write, and approve pairing requests. The server must run a new ZollyBot version.
- The Marketplace shows the connectors of the server under Apps, as on the desktop: Slack, Discord,
  Telegram, WhatsApp, GitHub, 1Password and Bitwarden, with the status of each. It also shows the MCP
  servers that you added. Owners and admins see them; a tap opens the settings of the connector or
  the server.
- You can select the Plush or Flat avatar style when you create or edit an agent. A flat agent shows the flat face of the desktop app in the agent list, chats and Live Activities, and breathes while it works. The face and colour stay the same when you change the style.
- Connect a server to Proton Pass from Marketplace › Apps. Sign in to Proton on the phone, or
  paste an access key. Agents on the server can then sign in to sites with the logins of one shared
  vault. The Proton Pass CLI needs a paid Proton plan.
- Settings > Voice has a "Pause before sending" slider, from 1 to 10 seconds. A voice conversation sends your words when it recognizes no new words for this long. The default is 1.5 seconds. (#5006)
- Settings > Voice > Speaking has a "Reply speed" choice for the replies that ZollyBot reads aloud.
- Connect Higgsfield from the Apps marketplace with browser sign-in to generate images, videos and audio, and check credits and assets. Each generation uses Higgsfield credits.

### Changed

- Agent faces move less while they rest: the eyes look round a little and more slowly, and the
  group of characters on the welcome and empty home screens floats less. The "Agent faces" switch in
  Settings now also stops the group's float.
- In the live browser view, a pinch or a two-finger pan follows the fingers smoothly while the page
  streams.
- The app keeps your channels and their latest messages in its encrypted copy on the phone, as it
  does for chats. After a start the channels show at once, before the server connects.
- The picture of a chat with more than one agent shows the members as a cluster, as on desktop.
  The faces are larger and overlap. One member fills the picture, two sit side by side, and three
  make a triangle. A chat with more than four members shows "+" and the number of the other members.
- A new chat or channel shows a short hint at the left, without a card: what you can do and how to
  start. The hint has no suggested options and no close button.
- The support log keeps 5,000 events, not 1,000, and records each step of a reconnect after a return to the app. A saved log now shows where a slow reconnect stops.
- **Show log** in **Settings → Support** opens the support log on its own page, newest first, and **Show older events** shows more of it. New events appear while the top of the log is in view. Before, the Support page showed only the last 100 events.
- Show the number of unread messages on the corner of an agent's avatar in the chat list, as on
  desktop. The count includes the agent's threads. Before, a dot next to the name showed only that
  the agent had unread messages.
- Connectors are now only in the Marketplace, as on the desktop. Server settings › AI no longer has
  a Connectors row. Open Marketplace › Apps to connect or change Slack, Discord, Telegram, WhatsApp,
  GitHub, 1Password or Bitwarden.
- A filtered or searched Marketplace list has Load more, as on the desktop, so it shows more than the first 50 agents and skills.
- The avatar editor has the groups of the desktop editor: Style, Shape, Eyes and Color. You select the shape and the eyes separately. Random face and Reset to ID are next to the Shape name.
- When an agent has no name, the "Enter a name for this agent." message shows under the Name field after you tap Create or Save, not at the bottom of the sheet while you edit.

### Fixed

- Felt agent avatars no longer have a dark outline in the light theme. The edge of the fur now has
  the colour of the avatar.
- A question card of an agent shows a Markdown link in the question as a link that you can open. Before, it
  showed the link text and the address as plain text. The answered summary shows it the same way.
- To confirm an action that needs a second step, or the main button of a dangerous card, touch and
  hold the button; a tap does not send it. With VoiceOver or TalkBack, a tap asks again in the card.
  Before, one tap sent the action.
- A confirm card shows the draft with its formatting and links. A long draft stops at a fixed
  height, and "Show all" opens the whole draft on its own screen, where you can copy it.
- A confirm card with a choice, such as the sender address, shows the options as buttons in the
  card.
- A list with more than one answer, or with many options, shows the options in the card. Before,
  you typed the option names.
- A link in a question opens. Before, it showed as text with brackets.
- An expired, cancelled or answered form still shows what it asked, such as the draft of a confirm
  card and the options of a question, as on desktop. Before, it showed only the title.
- When you drag a chat to the top or bottom of the list, the list scrolls at the same speed at any
  frame rate. Before, it scrolled faster or slower when the frame rate changed.
- With Reduce Motion on, the group of characters fades away when you continue from the welcome
  screen. Before, it flew off the screen.
- The blinking ZollyBot logo uses less battery: it draws no frames between blinks.
- When another app, such as a keyboard or Safari, opens `zollybot://` while ZollyBot runs, the app
  comes back on the same screen. Before, every server connected again and again until the
  connection service stopped the app for 60 seconds.
- Each chat and channel keeps its unsent text. Go to another agent and come back, and the text you typed is still in the message box.
- The agent list shows the work of an agent's side threads on the agent. The agent shows as working
