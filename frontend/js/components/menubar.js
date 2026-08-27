// components/menubar.js
// VS Code-style top application menu bar (File, Edit, View, Go, Run, Terminal, Help)

import { state } from '../core/state.js';
import { getFiles, toggleSidebar } from './sidebar.js';
import { iconService } from '../services/icon-service.js';
import { openPaletteWithMode } from './command-palette.js';
import { toggleTerminal, openTerminal, clearTerminalOutput, runLastTerminalCommand, newTerminalSession } from './terminal.js';

let activeMenu = null;
let currentZoom = 1.0;
const recentFileIds = [];

// Track recently opened files
state.subscribe((currentState) => {
    if (currentState.activeTabId) {
        const activeTab = currentState.getActiveTab();
        if (activeTab && activeTab.slug !== 'shortcuts') {
            const idx = recentFileIds.indexOf(activeTab.id);
            if (idx !== -1) recentFileIds.splice(idx, 1);
            recentFileIds.unshift(activeTab.id);
            if (recentFileIds.length > 8) recentFileIds.pop();
        }
    }
});

export function initMenubar() {
    const menubarEl = document.getElementById('app-menubar');
    if (!menubarEl) return;

    renderMenubar(menubarEl);

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (activeMenu && !menubarEl.contains(e.target)) {
            closeAllMenus();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeMenu) {
            closeAllMenus();
        }
    });

    // Dynamic fullscreen label synchronizers
    document.addEventListener('fullscreenchange', updateFullscreenLabel);
    document.addEventListener('webkitfullscreenchange', updateFullscreenLabel);
    updateFullscreenLabel();
}

export function closeAllMenus() {
    activeMenu = null;
    document.querySelectorAll('.menubar-item').forEach(item => {
        item.classList.remove('is-open');
        const btn = item.querySelector('.menubar-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
}

function openMenu(menuName) {
    closeAllMenus();
    activeMenu = menuName;
    const targetItem = document.querySelector(`.menubar-item[data-menu="${menuName}"]`);
    if (targetItem) {
        targetItem.classList.add('is-open');
        const btn = targetItem.querySelector('.menubar-btn');
        if (btn) btn.setAttribute('aria-expanded', 'true');

        // Dynamically update dynamic menus
        if (menuName === 'go') {
            updateGoMenuFiles(targetItem);
        } else if (menuName === 'file') {
            updateRecentFilesSubmenu(targetItem);
        } else if (menuName === 'view') {
            updateFullscreenLabel();
        }
    }
}

function toggleMenu(menuName) {
    if (activeMenu === menuName) {
        closeAllMenus();
    } else {
        openMenu(menuName);
    }
}

function renderMenubar(container) {
    container.innerHTML = `
        <div class="menubar-item" data-menu="file">
            <button type="button" class="menubar-btn" aria-haspopup="true" aria-expanded="false">File</button>
            <div class="menu-dropdown" role="menu">
                <div class="menu-item" data-action="new-tab">
                    <span class="menu-item-label">New Tab</span>
                    <span class="menu-item-shortcut">Ctrl+N</span>
                </div>
                <div class="menu-item" data-action="open-file">
                    <span class="menu-item-label">Open File...</span>
                    <span class="menu-item-shortcut">Ctrl+O</span>
                </div>
                <div class="menu-item" data-action="close-tab">
                    <span class="menu-item-label">Close Tab</span>
                    <span class="menu-item-shortcut">Ctrl+W</span>
                </div>
                <div class="menu-item" data-action="close-all-tabs">
                    <span class="menu-item-label">Close All Tabs</span>
                    <span class="menu-item-shortcut">Ctrl+K W</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item has-submenu" data-action="open-recent">
                    <span class="menu-item-label">Open Recent</span>
                    <span class="menu-item-arrow">›</span>
                    <div class="menu-dropdown submenu-dropdown" id="recent-files-submenu" role="menu">
                        <!-- Dynamic recent files -->
                    </div>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item" data-action="download-resume">
                    <span class="menu-item-label">Download Resume</span>
                    <span class="menu-item-shortcut">PDF</span>
                </div>
            </div>
        </div>

        <div class="menubar-item" data-menu="edit">
            <button type="button" class="menubar-btn" aria-haspopup="true" aria-expanded="false">Edit</button>
            <div class="menu-dropdown" role="menu">
                <div class="menu-item" data-action="find">
                    <span class="menu-item-label">Find...</span>
                    <span class="menu-item-shortcut">Ctrl+F</span>
                </div>
                <div class="menu-item" data-action="select-all">
                    <span class="menu-item-label">Select All</span>
                    <span class="menu-item-shortcut">Ctrl+A</span>
                </div>
                <div class="menu-item" data-action="copy">
                    <span class="menu-item-label">Copy</span>
                    <span class="menu-item-shortcut">Ctrl+C</span>
                </div>
            </div>
        </div>

        <div class="menubar-item" data-menu="view">
            <button type="button" class="menubar-btn" aria-haspopup="true" aria-expanded="false">View</button>
            <div class="menu-dropdown" role="menu">
                <div class="menu-item" data-action="command-palette">
                    <span class="menu-item-label">Command Palette</span>
                    <span class="menu-item-shortcut">Ctrl+Shift+P</span>
                </div>
                <div class="menu-item" data-action="toggle-sidebar">
                    <span class="menu-item-label">Toggle Sidebar</span>
                    <span class="menu-item-shortcut">Ctrl+B</span>
                </div>
                <div class="menu-item" data-action="toggle-terminal">
                    <span class="menu-item-label">Toggle Terminal</span>
                    <span class="menu-item-shortcut">Ctrl+\`</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item" data-action="fullscreen">
                    <span class="menu-item-label">Enter Full Screen</span>
                    <span class="menu-item-shortcut">F11</span>
                </div>
                <div class="menu-item" data-action="zoom-in">
                    <span class="menu-item-label">Zoom In</span>
                    <span class="menu-item-shortcut">Ctrl+=</span>
                </div>
                <div class="menu-item" data-action="zoom-out">
                    <span class="menu-item-label">Zoom Out</span>
                    <span class="menu-item-shortcut">Ctrl+-</span>
                </div>
                <div class="menu-item" data-action="reset-zoom">
                    <span class="menu-item-label">Reset Zoom</span>
                    <span class="menu-item-shortcut">Ctrl+0</span>
                </div>
            </div>
        </div>

        <div class="menubar-item" data-menu="go">
            <button type="button" class="menubar-btn" aria-haspopup="true" aria-expanded="false">Go</button>
            <div class="menu-dropdown" role="menu">
                <div class="menu-item" data-action="go-to-file">
                    <span class="menu-item-label">Go to File...</span>
                    <span class="menu-item-shortcut">Ctrl+P</span>
                </div>
                <div class="menu-separator"></div>
                <div class="dynamic-files-section" id="go-menu-files">
                    <!-- Dynamically listed available files -->
                </div>
            </div>
        </div>

        <div class="menubar-item" data-menu="run">
            <button type="button" class="menubar-btn" aria-haspopup="true" aria-expanded="false">Run</button>
            <div class="menu-dropdown" role="menu">
                <div class="menu-item" data-action="start-terminal">
                    <span class="menu-item-label">Start Terminal</span>
                    <span class="menu-item-shortcut">Ctrl+\`</span>
                </div>
                <div class="menu-item" data-action="run-last-command">
                    <span class="menu-item-label">Run Last Command</span>
                </div>
            </div>
        </div>

        <div class="menubar-item" data-menu="terminal">
            <button type="button" class="menubar-btn" aria-haspopup="true" aria-expanded="false">Terminal</button>
            <div class="menu-dropdown" role="menu">
                <div class="menu-item" data-action="new-terminal">
                    <span class="menu-item-label">New Terminal</span>
                </div>
                <div class="menu-item" data-action="toggle-terminal">
                    <span class="menu-item-label">Toggle Terminal</span>
                    <span class="menu-item-shortcut">Ctrl+\`</span>
                </div>
                <div class="menu-item" data-action="clear-terminal">
                    <span class="menu-item-label">Clear Terminal</span>
                </div>
            </div>
        </div>

        <div class="menubar-item" data-menu="help">
            <button type="button" class="menubar-btn" aria-haspopup="true" aria-expanded="false">Help</button>
            <div class="menu-dropdown" role="menu">
                <div class="menu-item" data-action="command-palette">
                    <span class="menu-item-label">Command Palette</span>
                    <span class="menu-item-shortcut">Ctrl+Shift+P</span>
                </div>
                <div class="menu-item" data-action="keyboard-shortcuts">
                    <span class="menu-item-label">Keyboard Shortcuts</span>
                    <span class="menu-item-shortcut">Ctrl+K S</span>
                </div>
                <div class="menu-separator"></div>
                <div class="menu-item" data-action="github">
                    <span class="menu-item-label">GitHub ↗</span>
                </div>
                <div class="menu-item" data-action="about">
                    <span class="menu-item-label">About</span>
                </div>
            </div>
        </div>
    `;

    // Bind click & hover on top-level buttons
    container.querySelectorAll('.menubar-item').forEach(item => {
        const menuName = item.dataset.menu;
        const btn = item.querySelector('.menubar-btn');

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu(menuName);
        });

        // Hover switching when ANY menu is active
        item.addEventListener('mouseenter', () => {
            if (activeMenu && activeMenu !== menuName) {
                openMenu(menuName);
            }
        });
    });

    // Bind action clicks inside menus
    container.querySelectorAll('.menu-item[data-action]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = item.dataset.action;
            executeMenuAction(action);
            closeAllMenus();
        });
    });
}

function updateFullscreenLabel() {
    const isFs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.querySelector('.app-container.is-fullscreen')
    );
    const fsLabels = document.querySelectorAll('.menu-item[data-action="fullscreen"] .menu-item-label');
    fsLabels.forEach(el => {
        el.textContent = isFs ? 'Exit Full Screen' : 'Enter Full Screen';
    });
}

function updateRecentFilesSubmenu(fileMenuItem) {
    const submenu = fileMenuItem.querySelector('#recent-files-submenu');
    if (!submenu) return;

    submenu.innerHTML = '';
    const allFiles = getFiles();
    const recentFiles = recentFileIds
        .map(id => allFiles.find(f => f.id === id))
        .filter(Boolean);

    const displayFiles = recentFiles.length > 0 ? recentFiles : allFiles.slice(0, 5);

    if (displayFiles.length === 0) {
        submenu.innerHTML = '<div class="menu-item is-disabled"><span class="menu-item-label">No recent files</span></div>';
        return;
    }

    displayFiles.forEach(file => {
        const itemEl = document.createElement('div');
        itemEl.className = 'menu-item file-menu-item';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'menu-item-label';

        const iconSpan = iconService.createFileIconElement(file);
        const nameText = document.createTextNode(` ${file.title}${file.extension || ''}`);

        labelSpan.appendChild(iconSpan);
        labelSpan.appendChild(nameText);
        itemEl.appendChild(labelSpan);

        itemEl.addEventListener('click', (e) => {
            e.stopPropagation();
            state.openTab(file);
            closeAllMenus();
        });

        submenu.appendChild(itemEl);
    });
}

function updateGoMenuFiles(goMenuItem) {
    const container = goMenuItem.querySelector('#go-menu-files');
    if (!container) return;

    container.innerHTML = '';
    const files = getFiles();

    files.forEach(file => {
        const itemEl = document.createElement('div');
        itemEl.className = 'menu-item file-menu-item';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'menu-item-label';

        const iconSpan = iconService.createFileIconElement(file);
        const nameText = document.createTextNode(` ${file.title}${file.extension || ''}`);

        labelSpan.appendChild(iconSpan);
        labelSpan.appendChild(nameText);
        itemEl.appendChild(labelSpan);

        itemEl.addEventListener('click', (e) => {
            e.stopPropagation();
            state.openTab(file);
            closeAllMenus();
        });

        container.appendChild(itemEl);
    });
}

function executeMenuAction(action) {
    switch (action) {
        // --- FILE ---
        case 'new-tab': {
            const files = getFiles();
            const unopened = files.find(f => !state.openTabs.some(t => t.id === f.id));
            if (unopened) {
                state.openTab(unopened);
            } else if (files.length > 0) {
                state.openTab(files[0]);
            }
            break;
        }
        case 'open-file':
            openPaletteWithMode('all');
            break;
        case 'close-tab':
            if (state.activeTabId) {
                state.closeTab(state.activeTabId);
            }
            break;
        case 'close-all-tabs':
            [...state.openTabs].forEach(tab => state.closeTab(tab.id));
            break;
        case 'download-resume': {
            const a = document.createElement('a');
            a.href = 'assets/resume/Mohamed_ IbrahimY_ Resume.pdf';
            a.download = 'Mohamed_ IbrahimY_ Resume.pdf';
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            break;
        }

        // --- EDIT ---
        case 'find':
            openPaletteWithMode('files');
            break;
        case 'select-all': {
            const activePane = document.querySelector('.content-pane');
            if (activePane) {
                const range = document.createRange();
                range.selectNodeContents(activePane);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            break;
        }
        case 'copy': {
            const selectedText = window.getSelection().toString();
            if (selectedText) {
                navigator.clipboard.writeText(selectedText).catch(() => {});
            }
            break;
        }

        // --- VIEW ---
        case 'command-palette':
            openPaletteWithMode('commands');
            break;
        case 'toggle-sidebar': {
            toggleSidebar();
            break;
        }
        case 'toggle-terminal':
            toggleTerminal();
            break;
        case 'fullscreen': {
            const maxBtn = document.querySelector('.mac-btn.maximize');
            const minBtn = document.querySelector('.mac-btn.minimize');
            const isFs = Boolean(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.querySelector('.app-container.is-fullscreen')
            );
            if (isFs) {
                if (minBtn) minBtn.click();
                else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            } else {
                if (maxBtn) maxBtn.click();
                else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
            }
            setTimeout(updateFullscreenLabel, 50);
            break;
        }
        case 'zoom-in':
            adjustZoom(0.1);
            break;
        case 'zoom-out':
            adjustZoom(-0.1);
            break;
        case 'reset-zoom':
            adjustZoom(0, true);
            break;

        // --- GO ---
        case 'go-to-file':
            openPaletteWithMode('all');
            break;

        // --- RUN ---
        case 'start-terminal':
            openTerminal();
            break;
        case 'run-last-command':
            runLastTerminalCommand();
            break;

        // --- TERMINAL ---
        case 'new-terminal':
            newTerminalSession();
            break;
        case 'clear-terminal':
            clearTerminalOutput();
            break;

        // --- HELP ---
        case 'keyboard-shortcuts':
            state.openTab({
                id: 'virtual-shortcuts',
                slug: 'shortcuts',
                title: 'Keyboard Shortcuts',
                type: 'page',
                icon: '⌨',
                virtual: true
            });
            break;
        case 'github':
            window.open('https://github.com/Ibrahim-2005', '_blank');
            break;
        case 'about': {
            const files = getFiles();
            const aboutNode = files.find(f => f.slug === 'about') || {
                id: 'about-page',
                slug: 'about',
                title: 'about',
                extension: '.html',
                type: 'page'
            };
            state.openTab(aboutNode);
            break;
        }
    }
}

function adjustZoom(delta, reset = false) {
    if (reset) {
        currentZoom = 1.0;
    } else {
        currentZoom = Math.min(1.4, Math.max(0.75, +(currentZoom + delta).toFixed(2)));
    }
    document.documentElement.style.zoom = currentZoom === 1.0 ? '' : `${currentZoom}`;
}
