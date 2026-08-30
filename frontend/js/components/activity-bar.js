// components/activity-bar.js
// Handles desktop activity bar actions: Explorer, Search, Source Control, Terminal, Download Resume, Settings

import { toggleSidebar } from './sidebar.js';
import { openPaletteWithMode } from './command-palette.js';
import { toggleTerminal } from './terminal.js';
import { api, API_BASE_URL } from '../core/api.js';
import { themes, setTheme, getCurrentTheme } from '../features/theme-engine.js';

let sourceControlLoaded = false;

export function initActivityBar() {
    const activityBar = document.getElementById('activity-bar');
    if (!activityBar) return;

    const explorerBtn = activityBar.querySelector('.activity-btn[data-action="explorer"]');
    const terminalBtn = activityBar.querySelector('.activity-btn[data-action="terminal"]');

    // Sync initial states
    syncExplorerActiveState();
    initSettingsPopover();

    // Listen to terminal toggled custom event
    document.addEventListener('terminalToggled', (e) => {
        if (terminalBtn) {
            if (e.detail && e.detail.isOpen) {
                terminalBtn.classList.add('active');
            } else {
                terminalBtn.classList.remove('active');
            }
        }
    });

    // Close popovers on click outside
    document.addEventListener('click', (e) => {
        const scPopover = document.getElementById('source-control-popover');
        const scBtn = document.querySelector('.activity-btn[data-action="source-control"]');
        if (scPopover && scPopover.classList.contains('open')) {
            if (!scPopover.contains(e.target) && (!scBtn || !scBtn.contains(e.target))) {
                toggleSourceControl(false);
            }
        }

        const setPopover = document.getElementById('settings-popover');
        const setBtn = document.querySelector('.activity-btn[data-action="settings"]');
        if (setPopover && setPopover.classList.contains('open')) {
            if (!setPopover.contains(e.target) && (!setBtn || !setBtn.contains(e.target))) {
                toggleSettings(false);
            }
        }
    });

    // Close popovers on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleSourceControl(false);
            toggleSettings(false);
        }
    });

    activityBar.querySelectorAll('.activity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            handleActivityAction(action);
        });
    });
}

export function toggleSourceControl(forceState) {
    const popover = document.getElementById('source-control-popover');
    const scBtn = document.querySelector('.activity-btn[data-action="source-control"]');
    if (!popover) return;

    const shouldOpen = forceState !== undefined ? forceState : !popover.classList.contains('open');

    if (shouldOpen) {
        toggleSettings(false);
        popover.classList.add('open');
        if (scBtn) scBtn.classList.add('active');
        if (!sourceControlLoaded) {
            loadSourceControlData();
        }
    } else {
        popover.classList.remove('open');
        if (scBtn) scBtn.classList.remove('active');
    }
}

export function toggleSettings(forceState) {
    const popover = document.getElementById('settings-popover');
    const setBtn = document.querySelector('.activity-btn[data-action="settings"]');
    if (!popover) return;

    const shouldOpen = forceState !== undefined ? forceState : !popover.classList.contains('open');

    if (shouldOpen) {
        toggleSourceControl(false);
        syncSettingsThemeState();
        popover.classList.add('open');
        if (setBtn) setBtn.classList.add('active');
    } else {
        popover.classList.remove('open');
        if (setBtn) setBtn.classList.remove('active');
    }
}

function initSettingsPopover() {
    const popover = document.getElementById('settings-popover');
    if (!popover) return;

    renderSettingsThemeList();
    syncSettingsThemeState();

    // Listen to themeChanged event
    document.addEventListener('themeChanged', () => {
        syncSettingsThemeState();
    });

    // Quick Action buttons
    popover.querySelectorAll('.settings-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            switch (action) {
                case 'command-palette':
                    toggleSettings(false);
                    openPaletteWithMode('all');
                    break;
                case 'toggle-terminal':
                    toggleSettings(false);
                    toggleTerminal();
                    break;
                case 'download-resume':
                    downloadResumeFile();
                    break;
                case 'toggle-fullscreen':
                    toggleFullscreen();
                    break;
            }
        });
    });
}

function renderSettingsThemeList() {
    const listEl = document.getElementById('settings-theme-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const currentTheme = getCurrentTheme();

    themes.forEach(theme => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'settings-theme-btn';
        btn.title = theme.description ? `${theme.name} — ${theme.description}` : theme.name;
        btn.setAttribute('aria-label', theme.name);
        btn.dataset.theme = theme.id;

        const leftSpan = document.createElement('span');
        leftSpan.className = 'theme-btn-left';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'theme-emoji-icon';
        iconSpan.textContent = theme.icon || theme.dot || '🎨';
        iconSpan.setAttribute('aria-hidden', 'true');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'theme-btn-name';
        nameSpan.textContent = theme.name;

        leftSpan.appendChild(iconSpan);
        leftSpan.appendChild(nameSpan);
        btn.appendChild(leftSpan);

        const checkSpan = document.createElement('span');
        checkSpan.className = 'theme-check';
        if (theme.id === currentTheme) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            checkSpan.textContent = '✓';
        } else {
            btn.setAttribute('aria-pressed', 'false');
        }
        btn.appendChild(checkSpan);

        btn.addEventListener('click', () => {
            setTheme(theme.id, true);
            syncSettingsThemeState();
        });

        listEl.appendChild(btn);
    });
}

function syncSettingsThemeState() {
    const currentTheme = getCurrentTheme();
    const themeBtns = document.querySelectorAll('.settings-theme-btn');
    themeBtns.forEach(btn => {
        const tId = btn.dataset.theme;
        const isMatch = (tId === currentTheme);

        const checkSpan = btn.querySelector('.theme-check');
        if (isMatch) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            if (checkSpan) checkSpan.textContent = '✓';
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
            if (checkSpan) checkSpan.textContent = '';
        }
    });

    const listEl = document.getElementById('settings-theme-list');
    const activeBtn = listEl?.querySelector('.settings-theme-btn.active');
    if (activeBtn) {
        activeBtn.scrollIntoView({ block: 'nearest' });
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

export function downloadResumeFile() {
    const a = document.createElement('a');
    a.href = `${API_BASE_URL}/resume`;
    a.download = 'Resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function loadSourceControlData() {
    const contentArea = document.getElementById('sc-content-area');
    if (!contentArea) return;

    contentArea.innerHTML = '<div class="sc-loading">Fetching repository status...</div>';

    try {
        const data = await api.getSourceControl();

        if (data && data.status === 'ok') {
            sourceControlLoaded = true;
            renderSourceControl(contentArea, data);
        } else {
            renderSourceControlError(contentArea, data?.repo_url || 'https://github.com/Ibrahim-2005/portfolio');
        }
    } catch (err) {
        console.error('Failed to load source control data:', err);
        renderSourceControlError(contentArea, 'https://github.com/Ibrahim-2005/portfolio');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderSourceControl(container, data) {
    const branchName = escapeHtml(data.branch || 'main');
    const shortSha = escapeHtml(data.short_sha || '');
    const commitMsg = escapeHtml(data.commit?.message || 'No commit message');
    const author = escapeHtml(data.commit?.author || 'Contributor');
    const relDate = escapeHtml(data.commit?.relative_date || 'recently');
    const repoUrl = escapeHtml(data.repo_url || 'https://github.com/Ibrahim-2005/portfolio');

    const modified = data.stats?.modified ?? 0;
    const added = data.stats?.added ?? 0;
    const deleted = data.stats?.deleted ?? 0;

    container.innerHTML = `
        <div class="sc-branch-row">
            <div class="sc-branch-info">
                <svg class="sc-branch-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="7" cy="6.5" r="2.5"></circle>
                    <circle cx="7" cy="17.5" r="2.5"></circle>
                    <circle cx="17.5" cy="12" r="2.5"></circle>
                    <line x1="7" y1="9" x2="7" y2="15"></line>
                    <line x1="7" y1="12" x2="15" y2="12"></line>
                </svg>
                <span class="sc-branch-name">${branchName}</span>
            </div>
            ${shortSha ? `<span class="sc-sha-badge">${shortSha}</span>` : ''}
        </div>

        <div class="sc-stats-grid">
            <div class="sc-stat-col" title="Files modified in latest commit">
                <span class="sc-stat-number stat-modified">${modified}</span>
                <span class="sc-stat-label">Modified</span>
            </div>
            <div class="sc-stat-col" title="Files added in latest commit">
                <span class="sc-stat-number stat-added">${added}</span>
                <span class="sc-stat-label">Added</span>
            </div>
            <div class="sc-stat-col" title="Files deleted in latest commit">
                <span class="sc-stat-number stat-deleted">${deleted}</span>
                <span class="sc-stat-label">Deleted</span>
            </div>
        </div>

        <div class="sc-separator"></div>

        <div class="sc-commit-section">
            <div class="sc-commit-header">LATEST COMMIT</div>
            <div class="sc-commit-message" title="${commitMsg}">${commitMsg}</div>
            <div class="sc-commit-meta">${author} • ${relDate}</div>
        </div>

        <div class="sc-separator"></div>

        <a
            href="${repoUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="sc-github-link"
        >
            <span>View on GitHub</span>
            <span class="sc-ext-arrow">↗</span>
        </a>
    `;
}

function renderSourceControlError(container, repoUrl) {
    container.innerHTML = `
        <div class="sc-error">
            <span>Unable to load repository status</span>
        </div>
        <div class="sc-separator"></div>
        <a
            href="${repoUrl}"
            target="_blank"
            rel="noopener noreferrer"
            class="sc-github-link"
        >
            <span>View on GitHub</span>
            <span class="sc-ext-arrow">↗</span>
        </a>
    `;
}

function syncExplorerActiveState() {
    const sidebar = document.querySelector('.sidebar');
    const explorerBtn = document.querySelector('.activity-btn[data-action="explorer"]');
    if (sidebar && explorerBtn) {
        const isOpen = !sidebar.classList.contains('collapsed');
        if (isOpen) {
            explorerBtn.classList.add('active');
        } else {
            explorerBtn.classList.remove('active');
        }
    }
}

function handleActivityAction(action) {
    if (action !== 'source-control') {
        toggleSourceControl(false);
    }
    if (action !== 'settings') {
        toggleSettings(false);
    }

    switch (action) {
        case 'explorer': {
            toggleSidebar();
            syncExplorerActiveState();
            break;
        }

        case 'search': {
            openPaletteWithMode('files');
            break;
        }

        case 'source-control': {
            toggleSourceControl();
            break;
        }

        case 'terminal': {
            toggleTerminal();
            break;
        }

        case 'download-resume': {
            downloadResumeFile();
            break;
        }

        case 'settings': {
            toggleSettings();
            break;
        }
    }
}
