# Keyboard Shortcuts — PortfolioOS

This document provides the authoritative reference for all keyboard shortcuts available in PortfolioOS, including browser compatibility rules, sequential chord architecture, and context-dependent bindings.

---

## 1. General Principles & Browser Sandbox Constraints

PortfolioOS runs as a web-based operating system inside standard desktop browsers (Chromium, Firefox, Safari) and follows strict web platform best practices:
- **No Hijacking of Critical Browser Commands**: Hard-reserved browser shortcuts (such as closing the browser tab with `Ctrl+W` or switching browser tabs with `Ctrl+Tab`) are intentionally **not intercepted**. Attempting to suppress these actions creates severe user disruption and is blocked by browser security sandboxes.
- **Cross-Platform Compatibility**: All shortcuts support `Ctrl` on Windows/Linux and `Cmd` (`⌘`) on macOS.
- **Input Focus Protection**: Shortcuts are safely bypassed when typing inside text inputs, textareas, or select dropdowns (except `Escape` for closing dialogs).
- **Escape Cascade**: The `Escape` key dismisses overlays in strict priority order (Pending Chords → Command Palette → Menus → Terminal Panel).
- **Chord Sequence Timeout**: Multi-key sequences (e.g. `Ctrl+K`) wait up to 2 seconds for the secondary key, and can be cancelled at any time by pressing `Escape`.

---

## 2. Information Hierarchy & Available Shortcuts

### Navigation & Palette
| Command | Keybinding (Win/Linux) | Keybinding (macOS) | Scope |
|---|---|---|---|
| Show Command Palette | `Ctrl + Shift + P` | `Cmd + Shift + P` | Global |
| Quick Open / Go to File | `Ctrl + P` | `Cmd + P` | Global |

### Preferences (Sequential Chords)
| Command | Keybinding (Win/Linux) | Keybinding (macOS) | Description |
|---|---|---|---|
| Color Theme Palette | `Ctrl + K` then `T` | `Cmd + K` then `T` | Opens palette in Themes Mode |
| Open Keyboard Shortcuts | `Ctrl + K` then `S` | `Cmd + K` then `S` | Opens Shortcuts virtual tab |

> **Note on Sequential Chords**: Press the first combination (`Ctrl+K` or `Cmd+K`), release it, then press the secondary key (`T` or `S`) within 2 seconds. Press `Escape` anytime to cancel.

### View & Layout
| Command | Keybinding (Win/Linux) | Keybinding (macOS) | Scope |
|---|---|---|---|
| Toggle Terminal Panel | ``Ctrl + ` `` | ``Cmd + ` `` | Global |
| Toggle Primary Side Bar | `Ctrl + B` | `Cmd + B` | Global |
| Toggle Full Screen | `F11` | `F11` | Global (Browser Native / Window Sync) |

### Tabs & Editors
| Command | Keybinding (Win/Linux) | Keybinding (macOS) | Scope |
|---|---|---|---|
| Close All Portfolio Tabs | `Ctrl + K` then `W` | `Cmd + K` then `W` | Global (Safely restores `home.py`) |

### Context-Specific Navigation
| Command | Keybinding | Required Context |
|---|---|---|
| Terminal Command History | `↑` / `↓` | **Terminal focused** |
| Terminal Theme Autocomplete | `Tab` | **Terminal focused** |
| Navigate Sidebar Tree | `↑` / `↓` | **Sidebar focused** |
| Open Selected / Toggle Folder | `Enter` | **Sidebar focused** |

### Overlays & Dialogs
| Command | Keybinding | Scope |
|---|---|---|
| Close Active Overlay / Cancel Pending Chord | `Escape` | Global |

---

## 3. Browser-Reserved Shortcuts (Not Intercepted by PortfolioOS)

The following combinations are intentionally left to native browser handling:

| Shortcut | Native Browser Action | Why PortfolioOS Does Not Intercept | PortfolioOS Alternative |
|---|---|---|---|
| `Ctrl+W` / `Cmd+W` | Closes the browser tab | Browser security prevents web apps from reliably blocking tab closure; prevents accidental browser shutdown. | Click the `×` button on any editor tab, or use the Command Palette (`File: Close Active Tab`). |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | Switches browser tabs | Handled by OS/browser window accelerators before web pages receive key events. | Click tab headers directly or use `Ctrl+P` Quick Open. |
| `Ctrl+N` / `Cmd+N` | Opens a new browser window | Browser-level window accelerator; cannot be overridden by web pages. | Use `File > New Tab` via Menubar or open files via Sidebar/Palette. |
| `Ctrl+O` / `Cmd+O` | Opens OS File dialog | Triggers browser's native file picker for local disks. | Use `Ctrl+P` (Quick Open / Go to File) to navigate portfolio sections. |
| `Ctrl+=` / `Ctrl+-` / `Ctrl+0` | Browser zoom controls | Browser handles page zoom natively. | Use browser native zoom or Menubar View actions. |

---

## 4. Terminal Command History Behavior

1. **History Storage**: Every executed non-empty command is saved to session history (ignoring consecutive duplicates).
2. **Navigation (`↑` / `↓`)**:
   - `↑` walks backward to older commands, preserving any unsent text as a draft.
   - `↓` walks forward through newer commands, restoring the unsent text when stepping past the newest command.
   - Cursor position automatically updates to the end of the line on each step.
