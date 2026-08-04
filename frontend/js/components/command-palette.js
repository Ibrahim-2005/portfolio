// components/command-palette.js
// Handles the Ctrl+Shift+P overlay, theme selection, quick open, and commands logic

import { themes, setTheme, getCurrentTheme } from '../features/theme-engine.js';
import { getFiles, openTabBySlug } from './sidebar.js';
import { state } from '../core/state.js';

let isPaletteOpenInternal = false;
let currentMode = 'commands'; // 'commands', 'themes', 'files'
let selectedIndex = 0;
let filteredItems = [];

const commands = [
    { id: 'cmd-theme', name: 'Preferences: Color Theme', action: () => openPaletteWithMode('themes') },
    { id: 'cmd-shortcuts', name: 'Preferences: Open Keyboard Shortcuts', action: () => openShortcutsView() },
    { id: 'cmd-terminal', name: 'View: Toggle Terminal', action: () => document.dispatchEvent(new KeyboardEvent('keydown', { key: '`', ctrlKey: true })) }
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

    // Close on click outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePalette();
        }
    });

    // Input filtering
    input.addEventListener('input', (e) => {
        filterItems(e.target.value);
    });

    // Keyboard navigation within palette
    input.addEventListener('keydown', (e) => {
        if (!isPaletteOpenInternal) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
            renderList();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            renderList();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems.length > 0) {
                executeItem(filteredItems[selectedIndex]);
            }
        }
    });
}

export function togglePalette() {
    if (isPaletteOpenInternal) closePalette();
    else openPaletteWithMode('commands');
}

export function openPaletteWithMode(mode) {
    isPaletteOpenInternal = true;
    currentMode = mode;
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('cmd-input');
    
    overlay.classList.add('visible');
    
    if (mode === 'themes') {
        input.placeholder = 'Select Color Theme...';
    } else if (mode === 'files') {
        input.placeholder = 'Search files by name...';
    } else {
        input.placeholder = 'Type a command...';
    }
    
    input.value = (mode === 'commands') ? '>' : '';
    filterItems(input.value);
    input.focus();
}

export function closePalette() {
    isPaletteOpenInternal = false;
    const overlay = document.getElementById('command-palette-overlay');
    overlay.classList.remove('visible');
}

function filterItems(query) {
    // If they typed >, switch to commands mode
    if (query.startsWith('>')) {
        currentMode = 'commands';
        query = query.substring(1).trim().toLowerCase();
    } else {
        query = query.trim().toLowerCase();
    }

    if (currentMode === 'themes') {
        filteredItems = themes.filter(t => t.name.toLowerCase().includes(query)).map(t => ({
            type: 'theme',
            id: t.id,
            name: t.name,
            isActive: t.id === getCurrentTheme()
        }));
    } else if (currentMode === 'files') {
        const files = getFiles();
        filteredItems = files.filter(f => f.title.toLowerCase().includes(query)).map(f => ({
            type: 'file',
            id: f.id,
            name: f.title,
            slug: f.slug,
            node: f
        }));
    } else {
        // Commands
        filteredItems = commands.filter(c => c.name.toLowerCase().includes(query)).map(c => ({
            type: 'command',
            id: c.id,
            name: c.name,
            action: c.action
        }));
    }

    selectedIndex = 0;
    
    // For themes, pre-select the active theme if query is empty
    if (currentMode === 'themes' && query === '') {
        const activeIndex = filteredItems.findIndex(t => t.isActive);
        if (activeIndex !== -1) selectedIndex = activeIndex;
    }
    
    renderList();
}

function executeItem(item) {
    if (item.type === 'theme') {
        setTheme(item.id);
        closePalette();
    } else if (item.type === 'file') {
        state.openTab(item.node);
        closePalette();
    } else if (item.type === 'command') {
        item.action();
        if (item.id !== 'cmd-theme') {
            closePalette();
        }
    }
}

function renderList() {
    const listEl = document.getElementById('cmd-list');
    listEl.innerHTML = '';
    
    if (filteredItems.length === 0) {
        listEl.innerHTML = '<div class="cmd-item" style="color:var(--fg-muted);">No results found</div>';
        return;
    }

    filteredItems.forEach((item, idx) => {
        const el = document.createElement('div');
        el.className = `cmd-item ${idx === selectedIndex ? 'selected' : ''}`;
        
        const label = document.createElement('span');
        label.textContent = item.name;
        
        if (item.type === 'theme' && item.isActive) {
            const check = document.createElement('span');
            check.textContent = '✓';
            check.style.opacity = '0.7';
            el.appendChild(label);
            el.appendChild(check);
        } else if (item.type === 'file') {
            const icon = document.createElement('span');
            icon.textContent = '📄 ';
            icon.style.opacity = '0.7';
            el.appendChild(icon);
            el.appendChild(label);
        } else {
            el.appendChild(label);
        }

        el.addEventListener('mouseenter', () => {
            selectedIndex = idx;
            renderList();
        });

        el.addEventListener('click', () => {
            executeItem(item);
        });

        listEl.appendChild(el);
    });
    
    // Scroll into view
    const selectedEl = listEl.querySelector('.selected');
    if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
    }
}

function openShortcutsView() {
    // Generate a virtual node for the shortcuts page
    const shortcutsNode = {
        id: 'virtual-shortcuts',
        slug: 'shortcuts',
        title: 'Keyboard Shortcuts',
        type: 'page',
        icon: '⌨',
        virtual: true // indicates it shouldn't be fetched from API
    };
    state.openTab(shortcutsNode);
}
