# Android App Layout

## Overview

The Android app mirrors the desktop/TUI information architecture with mobile-native patterns:
- **Bottom navigation** replaces left rail
- **Top app bar** replaces 2-row TopBar
- **Drawer** for floor switching
- **FAB** for primary actions

---

## Screen Structure

```
┌─────────────────────────────────────┐
│ Top App Bar                         │
│ [☰]  Floor Name          [⋮]        │
├─────────────────────────────────────┤
│                                     │
│                                     │
│        Content Area                 │
│        (Fragment/Compose)           │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ Bottom Navigation                   │
│ [🏠] [⚡] [🗺] [📋] [⚙]              │
└─────────────────────────────────────┘
```

---

## Top App Bar

| Element | Behavior |
|---------|----------|
| Drawer icon (☰) | Opens floor drawer |
| Floor title | Current floor name + agent count |
| Menu (⋮) | Context actions (settings, help, etc.) |

**Lobby**: Title = "Lobby (Butler)"  
**Office**: Title = "OfficeName (N agents)"

---

## Floor Drawer (Navigation Drawer)

```
┌─────────────────────────────────────┐
│ ZollyBot          [Account]         │
├─────────────────────────────────────┤
│                                     │
│  🏠 Lobby              (2)          │
│  🏢 OfficeA            (3)  ●       │
│  🏢 OfficeB            (1)          │
│                                     │
│  ────────────────────────────────   │
│                                     │
│  + New Office                       │
│                                     │
├─────────────────────────────────────┤
│ v0.63.0  |  Sync status             │
└─────────────────────────────────────┘
```

- Active floor marked with ●
- Tap to switch floor
- Long-press for floor options
- "New Office" creates floor

---

## Bottom Navigation

| Index | Icon | Label | Screen | Visible In |
|-------|------|-------|--------|------------|
| 0 | 🏠 | Agents | Agents list + detail | All |
| 1 | ⚡ | Routines | Routines list | Office |
| 2 | 🗺 | Workflows | Workflows canvas | Office |
| 3 | 📋 | Tasks | Tasks kanban | Office |
| 4 | ⚙ | More | Marketplace, Help, Settings | All |

**Lobby mode**: Only shows Agents (Butler chat) + More  
**Office mode**: Shows all 5 tabs

---

## Screens

### Lobby — Butler Chat

```
┌─────────────────────────────────────┐
│ Top Bar: Lobby (Butler)        [⋮]  │
├─────────────────────────────────────┤
│                                     │
│  Butler @ building                  │
│  gpt-4 / openai                     │
│  ────────────────────────────────   │
│                                     │
│  you: Hi there                      │
│  butler: Hello! How can I help?     │
│                                     │
│  ────────────────────────────────   │
│  [💬]  Type a message...   [Send]   │
│                                     │
├─────────────────────────────────────┤
│ [🏠] [⚙]                            │
└─────────────────────────────────────┘
```

**Menu (⋮)**: Toggle PTY harness, Account, Help, Settings

---

### Office — Agents List

```
┌─────────────────────────────────────┐
│ Top Bar: OfficeA (3)            [⋮] │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ AgentOne          openai    │   │
│  │ gpt-4              assistant│   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ AgentTwo          anthropic │   │
│  │ claude-3          coder     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ AgentThree         google   │   │
│  │ gemini-pro        researcher│   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [🏠] [⚡] [🗺] [📋] [⚙]              │
└─────────────────────────────────────┘
```

Tap agent → opens terminal harness (full screen)

---

### Office — Terminal Harness (Agent Detail)

```
┌─────────────────────────────────────┐
│ Top Bar: AgentOne @ OfficeA     [⋮] │
├─────────────────────────────────────┤
│                                     │
│  ████████████████████████████████  │
│  █ user@host:~$ █                  │
│  █                                │
│  █                                │
│  █                                │
│  █                                │
│  █                                │
│  █                                │
│  █                                │
│  █                                │
│  █                                │
│  █                                │
│  █                                │
│  ────────────────────────────────  │
│  [Type command...]       [Enter]   │
│                                     │
├─────────────────────────────────────┤
│ [🏠] [⚡] [🗺] [📋] [⚙]              │
└─────────────────────────────────────┘
```

**Menu (⋮)**: Switch model/effort, Agent profile, Disconnect

---

### More Screen (Marketplace, Help, Settings)

```
┌─────────────────────────────────────┐
│ Top Bar: More                 [✕]   │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏪 Marketplace              │   │
│  │ Browse skills & agents      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ❓ Help                     │   │
│  │ Docs, shortcuts, feedback   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ⚙ Settings                  │   │
│  │ App, account, sync          │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [🏠] [⚡] [🗺] [📋] [⚙]              │
└─────────────────────────────────────┘
```

---

## Settings Screen

```
┌─────────────────────────────────────┐
│ Top Bar: Settings             [✕]   │
├─────────────────────────────────────┤
│                                     │
│  ┌─ Account ────────────────────┐  │
│  │ Signed in as: user@domain    │  │
│  │ [Switch Account] [Sign Out]  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌─ Appearance ──────────────────┐  │
│  │ Theme: System / Light / Dark   │  │
│  │ Font size: [−] Normal [+]      │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌─ Sync ────────────────────────┐  │
│  │ Auto-sync: [ON]                │  │
│  │ Last sync: 2 min ago           │  │
│  │ [Sync Now]                     │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌─ Advanced ─────────────────────┐  │
│  │ Debug logging: [OFF]           │  │
│  │ Crash reports: [ON]            │  │
│  │ Version: 0.63.0 (build 123)    │  │
│  └──────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│ [🏠] [⚡] [🗺] [📋] [⚙]              │
└─────────────────────────────────────┘
```

---

## Color Palette (Material 3)

| Role | Light | Dark | Usage |
|------|-------|------|-------|
| Primary | `#6750A4` | `#D0BCFF` | Brand, active tab, FAB |
| On Primary | `#FFFFFF` | `#1D192B` | Text on primary |
| Secondary | `#625B71` | `#CCC2DC` | Subtle accents |
| Surface | `#FFFBFE` | `#1D1B20` | Cards, sheets |
| On Surface | `#1D1B20` | `#E6E1E5` | Primary text |
| Outline | `#79747E` | `#938F99` | Borders, dividers |
| Error | `#B3261E` | `#F2B8B5` | Errors, destructive |

---

## Typography

| Style | Font | Size | Weight |
|-------|------|------|--------|
| Display Large | Roboto | 57sp | Regular |
| Headline Medium | Roboto | 28sp | Regular |
| Title Large | Roboto | 22sp | Regular |
| Body Large | Roboto | 16sp | Regular |
| Body Medium | Roboto | 14sp | Regular |
| Label Large | Roboto | 14sp | Medium |

---

## Spacing

| Token | Value |
|-------|-------|
| xs | 4dp |
| sm | 8dp |
| md | 16dp |
| lg | 24dp |
| xl | 32dp |

---

## Build Configuration

| Property | Value |
|----------|-------|
| `minSdk` | 24 (Android 7.0) |
| `targetSdk` | 35 (Android 15) |
| `compileSdk` | 35 |
| `versionCode` | 6300 (0.63.0) |
| `versionName` | "0.63.0" |
| ABI | arm64-v8a, armeabi-v7a |

**Debug APK**: `./gradlew :app:assembleDebug`  
**Release AAB**: `./gradlew :app:bundleRelease`

---

## Key Differences from Desktop/TUI

| Feature | Desktop | TUI | Android |
|---------|---------|-----|---------|
| Floor switch | TopBar tabs | Row 0 + `f` key | Drawer |
| Navigation | Left rail | Row 2 panes | Bottom nav |
| Agent list | Rail + card | Pane 2 | Agents tab |
| Terminal | Card area | Pane 3 (50%) | Full screen |
| Settings | Modal | Row 1 `[s]` + LEADER | More tab |
| Marketplace | Rail bottom | Lobby rail `🏪` | More tab |
| Help | Rail bottom | Lobby rail `❓` | More tab |
| PTY toggle | N/A | `Leader+t` | Menu (⋮) |