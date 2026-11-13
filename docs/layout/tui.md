# TUI Layout

## Overall Structure (4 Rows)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Row 0:  Z  Lobby(2)  OfficeA(3)  OfficeB(1)  · server v1.2.3               │
├─────────────────────────────────────────────────────────────────────────────┤
│ Row 1:  AgentName@OfficeA                              [s] settings         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Row 2:  Body — Lobby or Office view (full width)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Row 3:  LEADER  f floors · a all · l lobby · c connect · i account · ...  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Row 0 — Logo + Floor Tabs

| Element | Style |
|---------|-------|
| `Z` logo | Bold, Yellow when lobby active |
| Floor tabs | `Lobby(count)` `OfficeA(count)*` — active floor highlighted Yellow |
| Server info | Right-aligned, DarkGray |

**Keys**: `f` = floors picker, `l` = lobby, number keys = direct floor

---

## Row 1 — Agent + Settings

| Element | Style |
|---------|-------|
| Active agent name | White bold |
| Office context | DarkGray |
| `[s] settings` | DarkGray, right-aligned |

**Key**: `s` = open settings

---

## Row 2 — Body

### Lobby Mode (`office_filter == "building"`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5% rail          │ 75% chat/PTY                    │ 25% offices (optional) │
│ ┌─────────────┐  │ ┌─────────────────────────────┐ │ ┌───────────────────┐ │
│ │ rail        │  │ │ chat · butler               │ │ │ offices           │ │
│ │             │  │ │                             │ │ │                   │ │
│ │ ⚙ settings  │  │ │ you: Hi                     │ │ │ › OfficeA (3)     │ │
│ │ 🏪 marketplace│  │ │ butler: Hello!            │ │ │   OfficeB (1)     │ │
│ │ ❓ help     │  │ │                             │ │ │                   │ │
│ └─────────────┘  │ │ > you: _                    │ │ └───────────────────┘ │
└──────────────────┴─────────────────────────────────┴────────────────────────┘
```

**Lobby rail** (5%): Bottom-only icons — `⚙` Settings, `🏪` Marketplace, `❓` Help

**Chat pane** (75%): Butler chat with composer, or PTY harness (toggle `Leader+t`)

**Offices pane** (25%, when targets exist): Selectable floor list, `j/k` navigate, `Enter` enter

### Office Mode (any floor)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5% icons  │ 20% list     │ 50% terminal (resizable)  │ 25% profile        │
│ ┌───────┐ │ ┌──────────┐ │ ┌──────────────────────┐ │ ┌────────────────┐ │
│ │ A     │ │ │ AGENT    │ │ │                      │ │ │ AgentName      │ │
│ │ O     │ │ │ PROVIDER │ │ │ ████████████████████ │ │ │ title          │ │
│ │       │ │ │ MODEL    │ │ │ ████████████████████ │ │ │                │ │
│ │       │ │ │ TITLE    │ │ │ ████████████████████ │ │ │ role    scope  │ │
│ └───────┘ │ └──────────┘ │ └──────────────────────┘ │ │ office model   │ │
│           │              │                          │ │ via    effort  │ │
│ (icon     │ (j/k select) │ (PTY harness,            │ │                │ │
│  gutter)  │  drives      │  real terminal)          │ │ Harness/model/ │ │
│           │  2/3/4)      │                          │ │ effort switcher│ │
└───────────┴──────────────┴──────────────────────────┴────────────────────┘
```

**Pane backgrounds & borders** (single plain border, no titles):

| Pane | Background | Border |
|------|------------|--------|
| Icons (1) | `#1e1e28` | Plain |
| List (2) | `#19232d` | Plain |
| Terminal (3) | `#141923` | Plain |
| Profile (4) | `#1e1e28` | Plain |

---

## Row 3 — Status / LEADER Bar

Visible when `Ctrl+Space` (prefix/Leader) pressed. Shows contextual options:

```
LEADER  f floors · a all · l lobby · c connect · i account · w window · s split · r refresh · q quit
```

**Office-only**: `o` = tasks  
**Lobby-only**: `t` = PTY/Chat toggle

---

## Key Bindings

| Key | Context | Action |
|-----|---------|--------|
| `j/k` | List panes | Navigate |
| `Enter` | List panes | Select/activate |
| `f` | Any | Floors picker |
| `l` | Any | Go to lobby |
| `s` | Any | Settings |
| `Ctrl+Space` | Any | Show LEADER bar |
| `t` | Lobby | Toggle PTY/Chat |
| `o` | Office | Tasks |
| `q` | Any | Quit |

---

## Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Primary accent | `#ffcc00` (Yellow) | Active floor, selected item, LEADER bar |
| Text primary | `#ffffff` (White) | Agent names, titles |
| Text muted | `#888888` (DarkGray) | Labels, hints, disabled |
| Pane 1 (icons) | `#1e1e28` | Icon gutter background |
| Pane 2 (list) | `#19232d` | Agent list background |
| Pane 3 (term) | `#141923` | Terminal background |
| Pane 4 (profile) | `#1e1e28` | Profile background |
| Rail | `#1e1e28` | Lobby rail background |