// frontend/js/components/statusbar.js
// Handles dynamic state synchronization, interactions, and accessibility for the PortfolioOS Status Bar

import { api } from '../core/api.js';
import { openTabBySlug } from './sidebar.js';
import { isTerminalOpen } from './terminal.js';
import { themes, getCurrentTheme } from '../features/theme-engine.js';

export function initStatusbar() {
    const statusbar = document.querySelector('.statusbar');
    if (!statusbar) return;

    // 1. Theme state synchronization
    const themeNameEl = document.getElementById('current-theme-name');
    const themeIconEl = document.getElementById('current-theme-icon');
    const syncTheme = (themeId) => {
        const currentId = themeId || getCurrentTheme();
        const found = themes.find(t => t.id === currentId);
        if (found) {
            if (themeNameEl) themeNameEl.textContent = found.name;
            if (themeIconEl) themeIconEl.textContent = found.icon || found.dot || '🎨';
        }
    };
    syncTheme();
    document.addEventListener('themeChanged', (e) => {
        syncTheme(e.detail?.theme);
    });

    // 2. Contact button interaction
    const contactBtn = document.getElementById('status-contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openTabBySlug('contact');
        });
    }

    // 3. Terminal state synchronization
    const termBtn = document.getElementById('status-terminal-btn');
    const syncTerminalState = (isOpen) => {
        if (!termBtn) return;
        termBtn.classList.toggle('active', !!isOpen);
        termBtn.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
    };
    syncTerminalState(isTerminalOpen);
    document.addEventListener('terminalToggled', (e) => {
        syncTerminalState(e.detail?.isOpen);
    });

    // 4. Source Control / Git branch & sync information
    const branchNameEl = document.getElementById('status-branch-name');
    const shortShaEl = document.getElementById('status-short-sha');
    const gitLink = document.getElementById('status-git-branch');

    const updateGitStatus = async () => {
        try {
            const data = await api.getSourceControl();
            if (data && data.status === 'ok') {
                if (branchNameEl && data.branch) {
                    branchNameEl.textContent = data.branch;
                }
                if (shortShaEl && data.short_sha) {
                    shortShaEl.textContent = data.short_sha;
                }
                if (gitLink) {
                    if (data.commit_url || data.repo_url) {
                        gitLink.href = data.commit_url || data.repo_url;
                    }
                    gitLink.title = `Source Control: ${data.branch || 'main'}${data.short_sha ? ` (${data.short_sha})` : ''}`;
                    gitLink.setAttribute('aria-label', `Source Control: ${data.branch || 'main'} branch${data.short_sha ? `, commit ${data.short_sha}` : ''}`);
                }
            }
        } catch (err) {
            // Graceful fallback to default 'main'
        }
    };
    updateGitStatus();
}
