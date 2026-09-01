// components/content-pane.js - Renders the content of the active tab
import { state } from '../core/state.js';
import { api, API_BASE_URL } from '../core/api.js';
import { renderProjects } from './project-card.js';
import { renderSkills } from './skills-view.js';
import { renderHome } from './home-view.js';
import { renderAbout } from './about-view.js';
import { renderEducation } from './education-view.js';
import { renderContact } from './contact-view.js';
import { renderResume, initResumeViewer } from './resume-view.js';

// Bounded cache (max 25 entries) to avoid memory leaks while optimizing tab switching
const MAX_CACHE_ENTRIES = 25;
const contentCache = new Map();

function setCachedContent(key, value) {
    if (contentCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = contentCache.keys().next().value;
        contentCache.delete(oldestKey);
    }
    contentCache.set(key, value);
}

function getCachedContent(key) {
    if (contentCache.has(key)) {
        const val = contentCache.get(key);
        contentCache.delete(key);
        contentCache.set(key, val);
        return val;
    }
    return null;
}

// Tab scroll positions map for scroll preservation across tabs
const tabScrollPositions = new Map();
let currentRenderedTabId = null;

function getWorkspaceSkeletonHtml() {
    return `
        <div class="workspace-skeleton" aria-label="Loading content">
            <div class="workspace-skeleton-comment skeleton-shimmer"></div>
            <div class="workspace-skeleton-heading skeleton-shimmer"></div>
            <div class="workspace-skeleton-tagline skeleton-shimmer"></div>
            <div class="workspace-skeleton-cards">
                <div class="workspace-skeleton-card skeleton-shimmer"></div>
                <div class="workspace-skeleton-card skeleton-shimmer"></div>
            </div>
        </div>`;
}

export async function renderContent() {
    const pane = document.querySelector('.content-pane');
    if (!pane) return;

    if (currentRenderedTabId !== null) {
        tabScrollPositions.set(currentRenderedTabId, pane.scrollTop);
    }

    const activeTab = state.getActiveTab();

    if (!activeTab) {
        currentRenderedTabId = null;
        pane.innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--fg-muted);">No file is open</div>';
        return;
    }

    const restoreTabScroll = () => {
        currentRenderedTabId = activeTab.id;
        if (activeTab.slug === 'home' || (activeTab.title && activeTab.title.toLowerCase() === 'home')) {
            pane.scrollTop = 0;
        } else if (tabScrollPositions.has(activeTab.id)) {
            pane.scrollTop = tabScrollPositions.get(activeTab.id);
        }
    };

    // Special case for Keyboard Shortcuts (virtual)
    if (activeTab.slug === 'shortcuts') {
        pane.innerHTML = `
        <div class="shortcuts-container">
            <div class="shortcuts-header">
                <h1 class="shortcuts-title">Keyboard Shortcuts</h1>
                <p class="shortcuts-intro">Essential keyboard shortcuts for navigating and controlling PortfolioOS.</p>
            </div>

            <div class="keyboard-shortcuts-grid">
                <!-- Left Column -->
                <div class="shortcuts-column">
                    <!-- 1. Navigation & Palette -->
                    <div class="shortcuts-card">
                        <div class="shortcuts-card-title">Navigation & Palette</div>
                        <table class="shortcuts-table">
                            <tr>
                                <td class="shortcuts-col-name">Show Command Palette</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Quick Open / Go to File</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>P</kbd></td>
                            </tr>
                        </table>
                    </div>

                    <!-- 2. Preferences (Chords) -->
                    <div class="shortcuts-card">
                        <div class="shortcuts-card-title">Preferences (Chords)</div>
                        <table class="shortcuts-table">
                            <tr>
                                <td class="shortcuts-col-name">Color Theme Palette</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd> <span class="shortcuts-chord-arrow">then</span> <kbd>T</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Open Keyboard Shortcuts</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd> <span class="shortcuts-chord-arrow">then</span> <kbd>S</kbd></td>
                            </tr>
                        </table>
                    </div>

                    <!-- 3. View & Layout -->
                    <div class="shortcuts-card">
                        <div class="shortcuts-card-title">View & Layout</div>
                        <table class="shortcuts-table">
                            <tr>
                                <td class="shortcuts-col-name">Toggle Terminal Panel</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>\`</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Toggle Sidebar Visibility</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>B</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Toggle Full Screen</td>
                                <td class="shortcuts-col-keys"><kbd>F11</kbd></td>
                            </tr>
                        </table>
                    </div>

                    <!-- 4. Tabs & Editors -->
                    <div class="shortcuts-card">
                        <div class="shortcuts-card-title">Tabs & Editors</div>
                        <table class="shortcuts-table">
                            <tr>
                                <td class="shortcuts-col-name">Close All Editors</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd> <span class="shortcuts-chord-arrow">then</span> <kbd>W</kbd></td>
                            </tr>
                        </table>
                    </div>

                    <!-- 5. Multi-Key Shortcuts (Chords) -->
                    <div class="shortcuts-card">
                        <div class="shortcuts-card-title">Multi-Key Shortcuts (Chords)</div>
                        <table class="shortcuts-table">
                            <tr>
                                <td class="shortcuts-col-name">Theme Palette</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd> <span class="shortcuts-chord-arrow">then</span> <kbd>T</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Keyboard Shortcuts</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd> <span class="shortcuts-chord-arrow">then</span> <kbd>S</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Close All Portfolio Tabs</td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl</kbd> + <kbd>K</kbd> <span class="shortcuts-chord-arrow">then</span> <kbd>W</kbd></td>
                            </tr>
                        </table>
                        <div class="shortcuts-chord-note">
                            Press the first key combination (<kbd>Ctrl+K</kbd> or <kbd>Cmd+K</kbd>), release it, then press the second key within 2 seconds. Press <kbd>Esc</kbd> to cancel.
                        </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="shortcuts-column">
                    <!-- 1. Terminal -->
                    <div class="shortcuts-card">
                        <div class="shortcuts-card-title">Terminal</div>
                        <table class="shortcuts-table">
                            <tr>
                                <td class="shortcuts-col-name">Previous Command (History)</td>
                                <td class="shortcuts-col-keys"><kbd>↑</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Next Command (History)</td>
                                <td class="shortcuts-col-keys"><kbd>↓</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Theme Autocomplete</td>
                                <td class="shortcuts-col-keys"><kbd>Tab</kbd></td>
                            </tr>
                        </table>
                    </div>

                    <!-- 2. Sidebar -->
                    <div class="shortcuts-card">
                        <div class="shortcuts-card-title">Sidebar</div>
                        <table class="shortcuts-table">
                            <tr>
                                <td class="shortcuts-col-name">Navigate Previous Item</td>
                                <td class="shortcuts-col-keys"><kbd>↑</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Navigate Next Item</td>
                                <td class="shortcuts-col-keys"><kbd>↓</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">Open Selected / Toggle Folder</td>
                                <td class="shortcuts-col-keys"><kbd>Enter</kbd></td>
                            </tr>
                        </table>
                    </div>

                    <!-- 3. Overlays -->
                    <div class="shortcuts-card">
                        <div class="shortcuts-card-title">Overlays</div>
                        <table class="shortcuts-table">
                            <tr>
                                <td class="shortcuts-col-name">Close Overlay / Cancel</td>
                                <td class="shortcuts-col-keys"><kbd>Esc</kbd></td>
                            </tr>
                        </table>
                    </div>

                    <!-- 4. Browser-Reserved Shortcuts -->
                    <div class="shortcuts-browser-card">
                        <div class="shortcuts-browser-card-title">
                            <span>💡</span> Browser-Reserved Shortcuts
                        </div>
                        <p class="shortcuts-browser-intro">
                            These shortcuts are controlled by your browser and cannot reliably be overridden by web apps:
                        </p>
                        <table class="shortcuts-table">
                            <tr>
                                <td class="shortcuts-col-name">
                                    <span class="browser-desc">Close browser tab</span>
                                    <span class="browser-hint">Use editor tab <kbd>×</kbd> button or <kbd>Ctrl+K</kbd> <span class="shortcuts-chord-arrow">then</span> <kbd>W</kbd></span>
                                </td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl+W</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">
                                    <span class="browser-desc">Switch browser tabs</span>
                                    <span class="browser-hint">Click portfolio tabs directly</span>
                                </td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl+Tab</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">
                                    <span class="browser-desc">New browser window</span>
                                </td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl+N</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">
                                    <span class="browser-desc">Open local disk file</span>
                                    <span class="browser-hint">Use <kbd>Ctrl+P</kbd> for portfolio files</span>
                                </td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl+O</kbd></td>
                            </tr>
                            <tr>
                                <td class="shortcuts-col-name">
                                    <span class="browser-desc">Browser page zoom</span>
                                </td>
                                <td class="shortcuts-col-keys"><kbd>Ctrl + / - / 0</kbd></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
        restoreTabScroll();
        return;
    }


    // Special case for Home tab (static)
    if (activeTab.slug === "home" || activeTab.title.toLowerCase() === "home") {
        pane.innerHTML = await renderHome();
        restoreTabScroll();
        return;
    }

    // Special case for Projects tab (custom rendering via its own API)
    if (activeTab.slug === 'projects') {
        pane.innerHTML = getWorkspaceSkeletonHtml();
        const html = await renderProjects();
        pane.innerHTML = html;
        restoreTabScroll();
        return;
    }

    // Special case for Skills tab (custom rendering via its own API)
    if (activeTab.slug === 'skills') {
        pane.innerHTML = getWorkspaceSkeletonHtml();
        const html = await renderSkills();
        pane.innerHTML = html;
        restoreTabScroll();
        return;
    }

    // Special case for Resume tab
    if (activeTab.slug === 'resume') {
        pane.innerHTML = getWorkspaceSkeletonHtml();
        const html = await renderResume();
        pane.innerHTML = html;
        restoreTabScroll();
        initResumeViewer();
        return;
    }


    // Check cache
    const cachedHtml = getCachedContent(activeTab.id);
    if (cachedHtml && activeTab.slug !== 'readme' && activeTab.slug !== 'certificates') {
        pane.innerHTML = cachedHtml;
        restoreTabScroll();
        return;
    }

    // Loading State
    pane.innerHTML = getWorkspaceSkeletonHtml();

    let html = '';
    if (activeTab.slug === 'about') {
        html = await renderAbout();
    } else if (activeTab.slug === 'education') {
        html = await renderEducation();
    } else if (activeTab.slug === 'contact') {
        html = await renderContact();
    } else if (activeTab.slug === 'readme') {
        const data = await api.getPageConfig('readme');
        let contentHtml = '';
        if (!data) {
            contentHtml = '<div style="color:red;padding:1rem 0;">Failed to load README.</div>';
        } else if (data.content) {
            if (window.marked && window.DOMPurify) {
                contentHtml = window.DOMPurify.sanitize(window.marked.parse(data.content));
            } else if (window.marked) {
                contentHtml = window.marked.parse(data.content);
            } else {
                contentHtml = `<pre>${data.content}</pre>`;
            }
        } else {
            contentHtml = '<div style="padding:1rem 0;"><i>No README content available.</i></div>';
        }

        html = `
<div class="about-page-container">
    <div class="about-page-comment">// readme</div>
    <h1 class="about-page-heading">README.md</h1>
    <h2 class="about-page-tagline">Project documentation, architecture, and technical details.</h2>
    <hr style="height: 1px; padding: 0; margin: 1.25rem 0 1.5rem 0; background-color: var(--border-color); border: 0;" />

    <div class="markdown-card">
        <div class="markdown-body">
            ${contentHtml}
        </div>
    </div>
</div>`;
    } else if (activeTab.slug === 'certificates') {
        const data = await api.getPageConfig('certificates');
        let contentHtml = '';
        if (!data) {
            contentHtml = '<div style="color:red;padding:1rem 0;">Failed to load Certificates.</div>';
        } else if (data.content) {
            if (window.marked && window.DOMPurify) {
                contentHtml = window.DOMPurify.sanitize(window.marked.parse(data.content));
            } else if (window.marked) {
                contentHtml = window.marked.parse(data.content);
            } else {
                contentHtml = `<pre>${data.content}</pre>`;
            }
        } else {
            contentHtml = '<div style="padding:1rem 0;"><i>No Certificates available.</i></div>';
        }

        html = `
<div class="about-page-container">
    <div class="about-page-comment">// certificates</div>
    <h1 class="about-page-heading">Certificates</h1>
    <h2 class="about-page-tagline">Courses, achievements, and verifications.</h2>
    <hr style="height: 1px; padding: 0; margin: 1.25rem 0 1.5rem 0; background-color: var(--border-color); border: 0;" />

    <div class="markdown-card">
        <div class="markdown-body">
            ${contentHtml}
        </div>
    </div>
</div>`;
    } else {
        html = '<div style="color:red;padding:2rem;">Failed to load content. Unknown page.</div>';
    }

    setCachedContent(activeTab.id, html);
    pane.innerHTML = html;
    restoreTabScroll();
}
