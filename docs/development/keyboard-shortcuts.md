# Keyboard Shortcuts — PortfolioOS

| Attribute | Value |
| --- | --- |
| **Document Name** | Keyboard Shortcuts & Accelerator Specification |
| **Product Name** | PortfolioOS |
| **Document Version** | 1.0 |
| **Status** | Approved |
| **Release** | PortfolioOS v1.0 |
| **Last Updated** | September 2026 |
| **Target Repository** | [github.com/Ibrahim-2005/portfolio](https://github.com/Ibrahim-2005/portfolio) |

---

## 1. Overview & Platform Architecture

PortfolioOS delivers a keyboard-driven desktop developer experience modeled after modern code editors. The shortcut architecture is managed centrally in [`frontend/js/features/keyboard-shortcuts.js`]

### Core Principles

- **Respect for Browser Sandboxes**: Hard-reserved browser shortcuts (such as closing a browser tab with `Ctrl+W` or switching browser tabs with `Ctrl+Tab`) are intentionally **not intercepted**. Attempting to suppress these actions creates severe user disruption and is blocked by browser security sandboxes.
- **Cross-Platform Parity**: Every shortcut supports `Ctrl` on Windows/Linux and `Cmd` (`⌘`) on macOS.
- **Input Focus Protection**: Hotkeys are safely bypassed when the user is actively typing inside text inputs, textareas, or `contenteditable` elements (with the exception of `Escape` for dismissing dialogs).
- **Sequential Chord Engine**: Supports multi-key chord sequences (e.g. `Ctrl+K` followed by a secondary key) with a 2-second timeout window.
- **Escape Cascade**: The `Escape` key dismisses UI overlays in strict priority order (Active Chord &rarr; Command Palette &rarr; Context Menus &rarr; Terminal Panel).
- **Responsive Availability**: Keyboard accelerators and the integrated terminal are desktop and tablet capabilities (&ge; 600px). On mobile devices (< 600px), the terminal panel is completely suppressed, and touch navigation uses the compact header and search modal.

---

## 2. Global Shortcuts Reference

### 2.1 Command Palette & Navigation

| Action | Windows / Linux | macOS | Scope | Notes |
| --- | --- | --- | --- | --- |
| **Show Command Palette** | `Ctrl + Shift + P` | `Cmd + Shift + P` | Global | Opens palette in action mode (`>`) |
| **Quick Open / Go to File** | `Ctrl + P` | `Cmd + P` | Global | Opens palette in file search mode |
| **Toggle Primary Sidebar** | `Ctrl + B` | `Cmd + B` | Global | Toggles Explorer file tree visibility |
| **Toggle Terminal Panel** | ``Ctrl + ` `` | ``Cmd + ` `` | Global | Toggles bottom terminal (Desktop & Tablet only) |
| **Toggle Full Screen** | `F11` | `F11` | Global | Syncs browser fullscreen with editor chrome |

---

### 2.2 Sequential Chords (`Ctrl + K` Chords)

To execute a sequential chord: press `Ctrl+K` (or `Cmd+K`), release both keys, then press the secondary key within **2 seconds**. Pressing `Escape` at any point cancels the sequence.

| Action | Sequence (Win/Linux) | Sequence (macOS) | Result |
| --- | --- | --- | --- |
| **Color Theme Palette** | `Ctrl + K` &rarr; `T` | `Cmd + K` &rarr; `T` | Opens palette focused in theme selection mode |
| **Keyboard Shortcuts Reference** | `Ctrl + K` &rarr; `S` | `Cmd + K` &rarr; `S` | Opens Shortcuts cheat sheet virtual tab |
| **Close All Editor Tabs** | `Ctrl + K` &rarr; `W` | `Cmd + K` &rarr; `W` | Closes all open tabs and restores `home.py` |

---

### 2.3 Context-Dependent Navigation

#### When Terminal Panel is Focused

| Key | Action |
| --- | --- |
| `↑` (Up Arrow) | Navigate backward to previous command in session history |
| `↓` (Down Arrow) | Navigate forward through newer commands in session history |
| `Tab` | Autocomplete `theme <name>` command or suggestion pills |
| `Escape` | Defocuses terminal input or collapses terminal panel |

#### When Explorer Sidebar is Focused

| Key | Action |
| --- | --- |
| `↑` / `↓` | Move selection between virtual files |
| `Enter` | Open selected virtual file in editor workspace |

#### Overlays & Modals

| Key | Action |
|---|---|
| `Esc` | Closes active overlay, command palette, context menu, or mobile drawer |

---

## 3. Responsive & Mobile Behavioral Rules

- **Terminal Suppression on Mobile (< 600px)**: The integrated terminal panel and its toggle shortcut (``Ctrl+` ``) are disabled on mobile screens. Connecting an external hardware keyboard to a mobile phone will not open the terminal panel.
- **Mobile Settings Actions**: On mobile viewports, the Settings drawer quick actions intentionally omit the *Toggle Terminal* and *Command Palette* buttons to maintain touch focus.
- **Mobile Touch Search**: On mobile screens, quick navigation is accessible via the search icon in the top navigation header (`#mobile-nav-header`), which opens the mobile touch search modal.

---

## 4. Browser-Reserved Combinations (Not Intercepted)

PortfolioOS deliberately allows the native browser to handle these keystrokes:

| Shortcut | Native Browser Action | Architectural Rationale | PortfolioOS Equivalent |
| --- | --- | --- | --- |
| `Ctrl + W` / `Cmd + W` | Closes browser tab | Web apps cannot reliably intercept browser tab closure across all modern sandboxes. | Click the `×` button on any editor tab header, or run `File: Close Active Tab` via Command Palette. |
| `Ctrl + Tab` | Cycles browser tabs | Processed at OS/browser level before web content receives key events. | Click tab headers directly or use `Ctrl+P` Quick Open. |
| `Ctrl + N` / `Cmd + N` | New browser window | Native browser window accelerator. | Use Menubar `File > New Tab` or click virtual files in Sidebar. |
| `Ctrl + O` / `Cmd + O` | Open local file dialog | Triggers OS local filesystem file picker. | Use `Ctrl+P` (Quick Open) to locate portfolio files. |
| `Ctrl + +` / `Ctrl + -` | Zoom in / Zoom out | Native browser accessibility zoom. | Use native browser zoom (fully supported with fluid rem typography). |

---

## 5. Terminal History & Navigation Architecture

The terminal input buffer implements standard shell behavior:

1. **Deduplication**: Consecutive identical commands are deduplicated in history.
2. **Draft Buffer Preservation**: If you begin typing an unfinished command (e.g. `theme dr`) and then press `↑` to browse history, your draft is preserved and automatically restored when you step back down with `↓`.
3. **End-of-Line Cursor Placement**: Navigating history automatically moves the cursor to the end of the restored command string.
