# Desktop Layout

## Overall Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ TopBar Row 1:  [Logo]  Floor1  Floor2  Floor3  ...                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ TopBar Row 2:  [Agent Name]                                        [⚙]     │
├──────────┬──────────────────────────────────────────────────────────────────┤
│          │                                                                 │
│  Rail    │  Card (page content)                                           │
│  (left)  │                                                                 │
│          │                                                                 │
├──────────┴──────────────────────────────────────────────────────────────────┤
```

---

## TopBar (2 Rows)

### Row 1 — Logo + Floor Tabs
| Element | Behavior |
|---------|----------|
| ZollyBot logo | Click → home/lobby |
| Floor tabs | `Lobby`, `OfficeA`, `OfficeB`… with agent counts |
| Active floor | Highlighted, bold |
| Hover floor | Preview tooltip |
| Click floor | Switch to that floor |

### Row 2 — Agent Context + Settings
| Element | Behavior |
|---------|----------|
| Active agent name | Shows current agent in selected floor |
| Agent role/scope | Muted text next to name |
| Settings button (⚙) | Opens settings panel |

**CSS**: `.top-bar` with `grid-template-rows: auto auto;`

---

## Page Rail (Left Sidebar)

### Lobby Mode (`activeOfficeId === "building"`)
**Bottom-only group** — no top navigation:

```
┌─────────────────┐
│                 │
│                 │  ← empty space
│                 │
│  ┌───────────┐  │
│  │ 🏪 Marketplace │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │ ❓ Help       │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │ ⚙ Settings    │  │
│  └───────────┘  │
└─────────────────┘
```

### Office Mode (any floor)
**Full rail** — top group (pinnable) + bottom group:

```
┌─────────────────┐
│ ZollyBot logo   │  ← only on web/macOS (no window buttons)
├─────────────────┤
│ ┌───────────┐   │
│ │ 🤖 Agents    │  │  ← always shown
│ └───────────┘   │
│ ┌───────────┐   │
│ │ ⚡ Routines  │  │  ← pinnable
│ └───────────┘   │
│ ┌───────────┐   │
│ │ 🗺 Workflows │  │  ← pinnable
│ └───────────┘   │
│ ┌───────────┐   │
│ │ 📋 Tasks     │  │  ← pinnable (if available)
│ └───────────┘   │
│ ┌───────────┐   │
│ │ 📅 Schedule  │  │  ← pinnable (if available)
│ └───────────┘   │
│ ┌───────────┐   │
│ │ 📊 Usage     │  │  ← always shown
│ └───────────┘   │
│ ┌───────────┐   │
│ │ 🔖 More…     │  │  ← pin/unpin menu
│ └───────────┘   │
├─────────────────┤
│ ┌───────────┐   │
│ │ 🏪 Marketplace│  │
│ └───────────┘   │
│ ┌───────────┐   │
│  │ ❓ Help       │  │
│  └───────────┘   │
│ ┌───────────┐   │
│  │ ⚙ Settings   │  │  ← shows update notice dot
│  └───────────┘   │
└─────────────────┘
```

**Pinnable pages**: Routines, Workflows, Tasks, Schedule  
**Always visible**: Agents, Usage, Marketplace, Help, Settings

---

## Card (Main Content Area)

| Page | Component | Notes |
|------|-----------|-------|
| Agents | `AgentsPage` | Sidebar list + detail |
| Routines | `RoutinesPage` | List + editor |
| Workflows | `WorkflowsPage` | Canvas + list |
| Tasks | `TasksPage` | Kanban + detail |
| Schedule | `SchedulePage` | Calendar view |
| Usage | `UsagePage` | Plan limits + custom agents |
| Marketplace | `MarketplaceModal` | Skills marketplace |
| Settings | `SettingsModal` | App + account settings |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+1..9` | Switch floor (1=Lobby) |
| `Ctrl+Shift+A` | Focus Agents in rail |
| `Ctrl+Shift+S` | Open Settings |
| `Ctrl+K` | Command palette |
| `Ctrl+Space` | Prefix/Leader (show options in status bar) |

---

## CSS Classes

| Class | Purpose |
|-------|---------|
| `.top-bar` | 2-row grid container |
| `.top-bar-row-1` | Logo + floors |
| `.top-bar-row-2` | Agent + settings |
| `.app-frame-with-topbar` | Body offset for top bar |
| `.window-rail` | Left sidebar nav |
| `.window-rail-group` | Top/bottom button groups |