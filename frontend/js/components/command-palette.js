// components/command-palette.js
// Handles the VS Code-style "Go to File / Run Command" palette, theme selection, and keyboard navigation

import { themes, setTheme, getCurrentTheme } from '../features/theme-engine.js';
import { getFiles, toggleSidebar } from './sidebar.js';
import { iconService } from '../services/icon-service.js';
import { state } from '../core/state.js';
import { toggleTerminal } from './terminal.js';
import { toggleFullscreen } from '../features/window-controls.js';
import { API_BASE_URL } from '../core/api.js';
import { closeAllMenus } from './menubar.js';
import { toggleSettings, toggleSourceControl } from './activity-bar.js';

let isPaletteOpenInternal = false;
let currentMode = 'all'; // 'all', 'files', 'commands', 'themes'
let selectedIndex = 0;
let filteredItems = [];

const commands = [
    {
        id: 'cmd-theme',
        name: 'Preferences: Color Theme',
        icon: '🎨',
        shortcut: 'Ctrl+K Ctrl+T',
        keywords: ['theme', 'color', 'appearance', 'palette', 'skin'],
        action: () => openPaletteWithMode('themes')
    },
    {
        id: 'cmd-shortcuts',
        name: 'Preferences: Open Keyboard Shortcuts',
        icon: '⌨',
        shortcut: 'Ctrl+K S',
        keywords: ['shortcuts', 'keyboard', 'hotkeys', 'keybindings', 'keys'],
        action: () => openShortcutsView()
    },
    {
        id: 'cmd-files',
        name: 'File: Go to File...',
        icon: '📄',
        shortcut: 'Ctrl+P',
        keywords: ['file', 'open', 'goto', 'find', 'navigate'],
        action: () => openPaletteWithMode('files')
    },
    {
        id: 'cmd-sidebar',
        name: 'View: Toggle Primary Side Bar',
        icon: '▤',
        shortcut: 'Ctrl+B',
        keywords: ['sidebar', 'side bar', 'explorer', 'tree', 'toggle sidebar'],
        action: () => toggleSidebar()
    },
    {
        id: 'cmd-terminal',
        name: 'View: Toggle Terminal',
        icon: '▭',
        shortcut: 'Ctrl+`',
        keywords: ['terminal', 'console', 'bash', 'shell', 'cli', 'cmd'],
        action: () => toggleTerminal()
    },
    {
        id: 'cmd-fullscreen',
        name: 'View: Toggle Full Screen',
        icon: '⛶',
        shortcut: 'F11',
        keywords: ['fullscreen', 'full screen', 'maximize', 'window'],
        action: () => toggleFullscreen()
    },
    {
        id: 'cmd-close-tab',
        name: 'File: Close Active Tab',
        icon: '×',
        shortcut: '',
        keywords: ['close tab', 'close editor', 'exit tab', 'tab'],
        action: () => {
            if (state.activeTabId) {
                state.closeTab(state.activeTabId);
            }
        }
    },
    {
        id: 'cmd-close-all-tabs',
        name: 'File: Close All Tabs',
        icon: '🗑',
        shortcut: 'Ctrl+K W',
        keywords: ['close all tabs', 'close all', 'clear tabs'],
        action: () => state.closeAllTabs()
    },
    {
        id: 'cmd-download-resume',
        name: 'File: Download Resume (PDF)',
        icon: '⬇',
        shortcut: '',
        keywords: ['resume', 'cv', 'pdf', 'download resume', 'bio'],
        action: () => {
            const a = document.createElement('a');
            a.href = `${API_BASE_URL}/resume`;
            a.download = 'Resume.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }
];

export function isPaletteOpen() {
    return isPaletteOpenInternal;
}

export function initPalette() {
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('cmd-input');
    const toggleBtn = document.getElementById('status-theme-toggle');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            openPaletteWithMode('themes');
        });
    }

    // Close on click outside (backdrop only)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePalette();
        }
    });

    const listEl = document.getElementById('cmd-list');
    if (listEl) {
        listEl.addEventListener('click', (e) => {
            const itemEl = e.target.closest('.cmd-item');
            if (itemEl && itemEl.dataset.index !== undefined) {
                const idx = parseInt(itemEl.dataset.index, 10);
                if (!isNaN(idx) && filteredItems[idx]) {
                    selectedIndex = idx;
                    executeSelectedItem();
                }
            }
        });
    }

    // Input filtering
    input.addEventListener('input', (e) => {
        filterItems(e.target.value);
    });

    // Keyboard navigation within palette
    input.addEventListener('keydown', (e) => {
        if (!isPaletteOpenInternal) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (filteredItems.length > 0) {
                const nextIndex = (selectedIndex + 1) % filteredItems.length;
                updateSelectedIndex(nextIndex, true);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (filteredItems.length > 0) {
                const nextIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
                updateSelectedIndex(nextIndex, true);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            executeSelectedItem();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closePalette();
        }
    });

    // Global keyboard navigation within palette for devices/tablets with physical keyboards
    document.addEventListener('keydown', (e) => {
        if (!isPaletteOpenInternal) return;
        if (document.activeElement === input) return; // already handled by input listener

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (filteredItems.length > 0) {
                const nextIndex = (selectedIndex + 1) % filteredItems.length;
                updateSelectedIndex(nextIndex, true);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (filteredItems.length > 0) {
                const nextIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
                updateSelectedIndex(nextIndex, true);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            executeSelectedItem();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closePalette();
        }
    });
}

export function togglePalette() {
    if (isPaletteOpenInternal) closePalette();
    else openPaletteWithMode('all');
}

export function openPaletteWithMode(mode = 'all') {
    closeAllMenus();
    toggleSettings(false);
    toggleSourceControl(false);
    isPaletteOpenInternal = true;
    currentMode = mode;
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('cmd-input');
    const prefix = overlay.querySelector('.cmd-prompt-prefix');

    overlay.classList.add('visible');

    if (mode === 'themes') {
        input.placeholder = 'Select Color Theme...';
        input.value = '';
        if (prefix) prefix.style.display = 'none';
    } else if (mode === 'commands') {
        input.placeholder = 'Type a command or search...';
        input.value = '';
        if (prefix) prefix.style.display = 'inline-block';
    } else if (mode === 'files') {
        input.placeholder = 'Go to file...';
        input.value = '';
        if (prefix) prefix.style.display = 'none';
    } else {
        input.placeholder = 'Go to file or run command...';
        input.value = '';
        if (prefix) prefix.style.display = 'inline-block';
    }

    filterItems(input.value);

    // On desktop (>1024px), focus input for immediate typing.
    // On non-desktop (<=1024px), do NOT auto-focus to prevent triggering the mobile virtual keyboard.
    if (window.innerWidth > 1024) {
        input.focus();
    }
}


export function closePalette() {
    isPaletteOpenInternal = false;
    const overlay = document.getElementById('command-palette-overlay');
    overlay.classList.remove('visible');
    const input = document.getElementById('cmd-input');
    if (input) input.blur();
}

function matchCommand(command, query) {
    if (!query) return true;
    const clean = query.trim().toLowerCase();
    if (!clean) return true;

    // 1. Direct name match
    if (command.name.toLowerCase().includes(clean)) return true;

    // 2. Direct ID match
    if (command.id.toLowerCase().includes(clean)) return true;

    // 3. Shortcut match (ignoring spaces)
    if (command.shortcut) {
        const normShortcut = command.shortcut.toLowerCase().replace(/\s+/g, '');
        const normQuery = clean.replace(/\s+/g, '');
        if (normShortcut.includes(normQuery)) return true;
    }

    // 4. Keywords match
    if (command.keywords && Array.isArray(command.keywords)) {
        if (command.keywords.some(k => k.toLowerCase().includes(clean))) return true;
    }

    // 5. Normalized alphanumeric match (e.g. "sidebar" matches "Side Bar", "fullscreen" matches "Full Screen")
    const normName = command.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normClean = clean.replace(/[^a-z0-9]/g, '');
    if (normClean && normName.includes(normClean)) return true;

    return false;
}

function matchFile(file, query) {
    if (!query) return true;
    const clean = query.trim().toLowerCase();
    if (!clean) return true;

    // Strip leading path slashes or dot-slashes, e.g. "/about", "./home"
    const stripped = clean.replace(/^[./\\]+/, '').trim();
    const target = stripped || clean;

    const title = (file.title || '').toLowerCase();
    const ext = (file.extension || '').toLowerCase();
    const fullName = `${title}${ext}`;
    const slug = (file.slug || '').toLowerCase();

    // 1. Exact or partial full name match (e.g. "about.html", "about", ".html")
    if (fullName.includes(target) || fullName.includes(clean)) return true;

    // 2. Title or slug match
    if (title.includes(target) || slug.includes(target)) return true;

    // 3. Extension match without dot (e.g. user typed "py", "sql", "html", "pdf")
    const extWithoutDot = ext.replace('.', '');
    if (extWithoutDot && (extWithoutDot === target || extWithoutDot.includes(target))) return true;

    // 4. Technology / language synonyms
    const fileSynonyms = {
        py: ['python', 'py'],
        html: ['html', 'markup', 'web'],
        sql: ['sql', 'database', 'postgres', 'db'],
        json: ['json', 'data', 'skills'],
        edu: ['education', 'academic', 'degrees', 'university', 'college'],
        sh: ['bash', 'shell', 'script', 'terminal', 'sh'],
        pdf: ['pdf', 'resume', 'cv', 'document']
    };
    const syns = fileSynonyms[extWithoutDot] || [];
    if (syns.some(s => s.includes(target) || target.includes(s))) return true;

    return false;
}

function filterItems(rawQuery = '') {
    let query = (rawQuery || '').trim();
    let isCommandPrefix = false;

    if (query.startsWith('>')) {
        isCommandPrefix = true;
        query = query.substring(1).trim().toLowerCase();
    } else {
        query = query.toLowerCase();
    }

    if (currentMode === 'themes') {
        filteredItems = themes
            .filter(t => t.name.toLowerCase().includes(query))
            .map(t => ({
                type: 'theme',
                id: t.id,
                name: t.name,
                icon: t.icon || t.dot || '🎨',
                color: t.color,
                isActive: t.id === getCurrentTheme()
            }));

        selectedIndex = 0;
        if (query === '') {
            const activeIndex = filteredItems.findIndex(t => t.isActive);
            if (activeIndex !== -1) selectedIndex = activeIndex;
        }
    } else if (currentMode === 'commands') {
        // STRICT COMMANDS MODE: Only commands. No files, themes, or unrelated entries.
        filteredItems = commands
            .filter(c => matchCommand(c, query))
            .map(c => ({
                type: 'command',
                id: c.id,
                name: c.name,
                icon: c.icon,
                shortcut: c.shortcut,
                action: c.action
            }));
        selectedIndex = 0;
    } else if (currentMode === 'files') {
        // STRICT FILES MODE: Only files. No commands, themes, or unrelated entries.
        const files = getFiles();
        filteredItems = files
            .filter(f => matchFile(f, query))
            .map(f => ({
                type: 'file',
                id: f.id,
                name: `${f.title}${f.extension || ''}`,
                slug: f.slug,
                node: f
            }));
        selectedIndex = 0;
    } else {
        // UNIFIED MODE ('all')
        if (isCommandPrefix) {
            filteredItems = commands
                .filter(c => matchCommand(c, query))
                .map(c => ({
                    type: 'command',
                    id: c.id,
                    name: c.name,
                    icon: c.icon,
                    shortcut: c.shortcut,
                    action: c.action
                }));
            selectedIndex = 0;
        } else {
            const matchedCommands = commands
                .filter(c => matchCommand(c, query))
                .map(c => ({
                    type: 'command',
                    id: c.id,
                    name: c.name,
                    icon: c.icon,
                    shortcut: c.shortcut,
                    action: c.action
                }));

            const files = getFiles();
            const matchedFiles = files
                .filter(f => matchFile(f, query))
                .map(f => ({
                    type: 'file',
                    id: f.id,
                    name: `${f.title}${f.extension || ''}`,
                    slug: f.slug,
                    node: f
                }));

            filteredItems = [...matchedCommands, ...matchedFiles];
            selectedIndex = 0;
        }
    }

    if (selectedIndex >= filteredItems.length) {
        selectedIndex = 0;
    }

    renderList();
}

function executeSelectedItem() {
    if (filteredItems.length > 0 && filteredItems[selectedIndex]) {
        executeItem(filteredItems[selectedIndex]);
    }
}

function updateSelectedIndex(newIdx, scrollIntoView = false) {
    if (newIdx < 0 || newIdx >= filteredItems.length) return;
    selectedIndex = newIdx;

    const listEl = document.getElementById('cmd-list');
    if (!listEl) return;

    const prevSelected = listEl.querySelector('.cmd-item.selected');
    if (prevSelected) {
        prevSelected.classList.remove('selected');
        prevSelected.setAttribute('aria-selected', 'false');
    }

    const newSelected = listEl.querySelector(`.cmd-item[data-index="${selectedIndex}"]`);
    if (newSelected) {
        newSelected.classList.add('selected');
        newSelected.setAttribute('aria-selected', 'true');
        if (scrollIntoView) {
            newSelected.scrollIntoView({ block: 'nearest' });
        }
    }
}

function executeItem(item) {
    if (!item) return;

    if (item.type === 'theme') {
        setTheme(item.id);
        closePalette();
    } else if (item.type === 'file') {
        state.openTab(item.node);
        closePalette();
    } else if (item.type === 'command') {
        item.action();
        if (item.id !== 'cmd-theme' && item.id !== 'cmd-files') {
            closePalette();
        }
    }
}

function renderList() {
    const listEl = document.getElementById('cmd-list');
    listEl.innerHTML = '';

    if (filteredItems.length === 0) {
        let emptyMsg = 'No files or commands found.';
        if (currentMode === 'themes') emptyMsg = 'No matching themes found.';
        else if (currentMode === 'commands') emptyMsg = 'No matching commands found.';
        else if (currentMode === 'files') emptyMsg = 'No matching files found.';
        listEl.innerHTML = `<div class="cmd-empty">${emptyMsg}</div>`;
        return;
    }

    if (currentMode === 'themes') {
        const sectionEl = document.createElement('div');
        sectionEl.className = 'cmd-section-header';
        sectionEl.textContent = 'THEMES';
        listEl.appendChild(sectionEl);

        filteredItems.forEach((item, idx) => {
            const el = createThemeRow(item, idx);
            listEl.appendChild(el);
        });
    } else {
        const commandItems = filteredItems.filter(it => it.type === 'command');
        const fileItems = filteredItems.filter(it => it.type === 'file');

        let globalIndex = 0;

        // 1. COMMANDS SECTION
        if (commandItems.length > 0) {
            const cmdHeader = document.createElement('div');
            cmdHeader.className = 'cmd-section-header';
            cmdHeader.textContent = 'COMMANDS';
            listEl.appendChild(cmdHeader);

            commandItems.forEach(item => {
                const el = createCommandRow(item, globalIndex);
                listEl.appendChild(el);
                globalIndex++;
            });
        }

        // 2. FILES SECTION (BELOW COMMANDS)
        if (fileItems.length > 0) {
            const fileHeader = document.createElement('div');
            fileHeader.className = 'cmd-section-header';
            fileHeader.textContent = 'FILES';
            listEl.appendChild(fileHeader);

            fileItems.forEach(item => {
                const el = createFileRow(item, globalIndex);
                listEl.appendChild(el);
                globalIndex++;
            });
        }
    }

    // Scroll selected element into view
    const selectedEl = listEl.querySelector('.selected');
    if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
    }
}

function createFileRow(item, idx) {
    const el = document.createElement('div');
    el.className = `cmd-item ${idx === selectedIndex ? 'selected' : ''}`;
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', idx === selectedIndex ? 'true' : 'false');
    el.dataset.index = idx;

    const leftGroup = document.createElement('div');
    leftGroup.className = 'cmd-item-left';

    const iconSpan = iconService.createFileIconElement(item.node);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'cmd-item-name';
    nameSpan.textContent = item.name;

    leftGroup.appendChild(iconSpan);
    leftGroup.appendChild(nameSpan);

    el.appendChild(leftGroup);

    el.addEventListener('mouseenter', () => {
        updateSelectedIndex(idx, false);
    });

    el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedIndex = idx;
        executeSelectedItem();
    });

    return el;
}

function createCommandRow(item, idx) {
    const el = document.createElement('div');
    el.className = `cmd-item ${idx === selectedIndex ? 'selected' : ''}`;
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', idx === selectedIndex ? 'true' : 'false');
    el.dataset.index = idx;

    const leftGroup = document.createElement('div');
    leftGroup.className = 'cmd-item-left';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'icon cmd-file-icon';
    iconSpan.textContent = item.icon || '⚡';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'cmd-item-name';
    nameSpan.textContent = item.name;

    leftGroup.appendChild(iconSpan);
    leftGroup.appendChild(nameSpan);

    el.appendChild(leftGroup);

    if (item.shortcut) {
        const shortcutSpan = document.createElement('span');
        shortcutSpan.className = 'cmd-item-shortcut';
        shortcutSpan.textContent = item.shortcut;
        el.appendChild(shortcutSpan);
    }

    el.addEventListener('mouseenter', () => {
        updateSelectedIndex(idx, false);
    });

    el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedIndex = idx;
        executeSelectedItem();
    });

    return el;
}

function createThemeRow(item, idx) {
    const el = document.createElement('div');
    el.className = `cmd-item ${idx === selectedIndex ? 'selected' : ''}`;
    el.setAttribute('role', 'option');
    el.setAttribute('aria-selected', idx === selectedIndex ? 'true' : 'false');
    el.dataset.index = idx;

    const leftGroup = document.createElement('div');
    leftGroup.className = 'cmd-item-left';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'icon cmd-theme-icon';
    iconSpan.textContent = item.icon || '🎨';
    iconSpan.setAttribute('aria-hidden', 'true');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'cmd-item-name';
    nameSpan.textContent = item.name;

    leftGroup.appendChild(iconSpan);
    leftGroup.appendChild(nameSpan);

    el.appendChild(leftGroup);

    if (item.isActive) {
        const check = document.createElement('span');
        check.className = 'cmd-item-check';
        check.textContent = '✓';
        el.appendChild(check);
    }

    el.addEventListener('mouseenter', () => {
        updateSelectedIndex(idx, false);
    });

    el.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedIndex = idx;
        executeSelectedItem();
    });

    return el;
}

function openShortcutsView() {
    const shortcutsNode = {
        id: 'virtual-shortcuts',
        slug: 'shortcuts',
        title: 'Keyboard Shortcuts',
        type: 'page',
        icon: '⌨',
        virtual: true
    };
    state.openTab(shortcutsNode);
}
