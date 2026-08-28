// components/command-palette.js
// Handles the VS Code-style "Go to File / Run Command" palette, theme selection, and keyboard navigation

import { themes, setTheme, getCurrentTheme } from '../features/theme-engine.js';
import { getFiles, toggleSidebar } from './sidebar.js';
import { iconService } from '../services/icon-service.js';
import { state } from '../core/state.js';
import { toggleTerminal } from './terminal.js';
import { toggleFullscreen } from '../features/window-controls.js';

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
        action: () => openPaletteWithMode('themes')
    },
    {
        id: 'cmd-shortcuts',
        name: 'Preferences: Open Keyboard Shortcuts',
        icon: '⌨',
        shortcut: 'Ctrl+K S',
        action: () => openShortcutsView()
    },
    {
        id: 'cmd-files',
        name: 'File: Go to File...',
        icon: '📄',
        shortcut: 'Ctrl+P',
        action: () => openPaletteWithMode('files')
    },
    {
        id: 'cmd-sidebar',
        name: 'View: Toggle Primary Side Bar',
        icon: '▤',
        shortcut: 'Ctrl+B',
        action: () => toggleSidebar()
    },
    {
        id: 'cmd-terminal',
        name: 'View: Toggle Terminal',
        icon: '▭',
        shortcut: 'Ctrl+`',
        action: () => toggleTerminal()
    },
    {
        id: 'cmd-fullscreen',
        name: 'View: Toggle Full Screen',
        icon: '⛶',
        shortcut: 'F11',
        action: () => toggleFullscreen()
    },
    {
        id: 'cmd-close-tab',
        name: 'File: Close Active Tab',
        icon: '×',
        shortcut: 'Ctrl+W',
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
        action: () => state.closeAllTabs()
    },
    {
        id: 'cmd-download-resume',
        name: 'File: Download Resume (PDF)',
        icon: '⬇',
        shortcut: '',
        action: () => {
            const a = document.createElement('a');
            a.href = 'assets/resume/Mohamed_ IbrahimY_ Resume.pdf';
            a.download = 'Mohamed_ IbrahimY_ Resume.pdf';
            a.target = '_blank';
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
}

export function togglePalette() {
    if (isPaletteOpenInternal) closePalette();
    else openPaletteWithMode('all');
}

export function openPaletteWithMode(mode = 'all') {
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
    input.focus();
}

export function closePalette() {
    isPaletteOpenInternal = false;
    const overlay = document.getElementById('command-palette-overlay');
    overlay.classList.remove('visible');
    const input = document.getElementById('cmd-input');
    if (input) input.blur();
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
                isActive: t.id === getCurrentTheme()
            }));

        selectedIndex = 0;
        if (query === '') {
            const activeIndex = filteredItems.findIndex(t => t.isActive);
            if (activeIndex !== -1) selectedIndex = activeIndex;
        }
    } else if (currentMode === 'commands' || isCommandPrefix) {
        filteredItems = commands
            .filter(c => c.name.toLowerCase().includes(query))
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
        const files = getFiles();
        filteredItems = files
            .filter(f => {
                const fullName = `${f.title}${f.extension || ''}`.toLowerCase();
                return fullName.includes(query) || (f.slug && f.slug.toLowerCase().includes(query));
            })
            .map(f => ({
                type: 'file',
                id: f.id,
                name: `${f.title}${f.extension || ''}`,
                slug: f.slug,
                node: f
            }));
        selectedIndex = 0;
    } else {
        // Unified mode ('all')
        const matchedCommands = commands
            .filter(c => c.name.toLowerCase().includes(query))
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
            .filter(f => {
                const fullName = `${f.title}${f.extension || ''}`.toLowerCase();
                return fullName.includes(query) || (f.slug && f.slug.toLowerCase().includes(query));
            })
            .map(f => ({
                type: 'file',
                id: f.id,
                name: `${f.title}${f.extension || ''}`,
                slug: f.slug,
                node: f
            }));

        if (query === '') {
            filteredItems = [...matchedCommands, ...matchedFiles];
        } else {
            filteredItems = [...matchedCommands, ...matchedFiles];
        }
        selectedIndex = 0;
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
    iconSpan.className = 'icon cmd-file-icon';
    iconSpan.textContent = '🎨';

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
