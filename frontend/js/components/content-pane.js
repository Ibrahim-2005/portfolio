// components/content-pane.js - Renders the content of the active tab
import { state } from '../core/state.js?v=5';
import { api, API_BASE_URL } from '../core/api.js?v=5';
import { renderProjects } from './project-card.js';
import { renderSkills } from './skills-view.js';
import { renderHome } from './home-view.js';
import { renderAbout } from './about-view.js';
import { renderEducation } from './education-view.js';
import { renderContact } from './contact-view.js';

// Cache to avoid re-rendering content for the same tab repeatedly
const contentCache = {};

export async function renderContent() {
    const pane = document.querySelector('.content-pane');
    const activeTab = state.getActiveTab();

    if (!activeTab) {
        pane.innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--fg-muted);">No file is open</div>';
        return;
    }

    // Special case for Keyboard Shortcuts (virtual)
    if (activeTab.slug === 'shortcuts') {
        pane.innerHTML = `
        <div style="padding: 2rem;">
            <h1 style="margin-bottom: 1rem; color: var(--fg-default);">Keyboard Shortcuts</h1>
            <p style="margin-bottom: 2rem; color: var(--fg-muted);">These shortcuts work anywhere on the site (unless you're typing in an input field).</p>
            <table style="width: 100%; border-collapse: collapse; color: var(--fg-default);">
                <tr style="border-bottom: 1px solid var(--border-color); text-align: left;">
                    <th style="padding: 10px;">Command</th>
                    <th style="padding: 10px;">Keybinding</th>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">Show Command Palette</td>
                    <td style="padding: 10px;"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd></td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">Quick Open File</td>
                    <td style="padding: 10px;"><kbd>Ctrl</kbd> + <kbd>P</kbd></td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">Preferences: Color Theme</td>
                    <td style="padding: 10px;"><kbd>Ctrl</kbd> + <kbd>K</kbd> <kbd>Ctrl</kbd> + <kbd>T</kbd></td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">Toggle Terminal Panel</td>
                    <td style="padding: 10px;"><kbd>Ctrl</kbd> + <kbd>\`</kbd></td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">Toggle Sidebar Visibility</td>
                    <td style="padding: 10px;"><kbd>Ctrl</kbd> + <kbd>B</kbd></td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">Close Active Editor</td>
                    <td style="padding: 10px;"><kbd>Ctrl</kbd> + <kbd>W</kbd></td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">Open Next Editor</td>
                    <td style="padding: 10px;"><kbd>Ctrl</kbd> + <kbd>Tab</kbd></td>
                </tr>
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 10px;">Open Previous Editor</td>
                    <td style="padding: 10px;"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Tab</kbd></td>
                </tr>
                <tr>
                    <td style="padding: 10px;">Navigate Sidebar</td>
                    <td style="padding: 10px;"><kbd>↑</kbd> / <kbd>↓</kbd> / <kbd>Enter</kbd> (when sidebar is focused)</td>
                </tr>
            </table>
        </div>`;
        return;
    }


    // Special case for Home tab (static)
    if (activeTab.slug === 'home' || activeTab.title.toLowerCase() === 'home') {
        pane.innerHTML = HOME_STATIC_HTML;
        return;
    }

    // Special case for Projects tab (custom rendering via its own API)
    if (activeTab.slug === 'projects') {
        pane.innerHTML = '<div style="color:var(--fg-muted);">Loading projects...</div>';
        const html = await renderProjects();
        pane.innerHTML = html;
        return;
    }

    // Special case for Skills tab (custom rendering via its own API)
    if (activeTab.slug === 'skills') {
        pane.innerHTML = '<div style="color:var(--fg-muted);">Loading skills...</div>';
        const html = await renderSkills();
        pane.innerHTML = html;
        return;
    }

    // Special case for Resume tab
    if (activeTab.slug === 'resume') {
        const resumeUrl = `${API_BASE_URL}/resume`;
        pane.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100%; padding: 1rem;">
                <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
                    <a href="${resumeUrl}" target="_blank" download="Resume.pdf" class="cta-button primary" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center;">Download PDF</a>
                </div>
                <iframe src="${resumeUrl}" style="flex-grow: 1; width: 100%; border: 1px solid var(--border-color); border-radius: 4px; background: white;"></iframe>
            </div>
        `;
        return;
    }


    // Check cache
    if (contentCache[activeTab.id]) {
        pane.innerHTML = contentCache[activeTab.id];
        return;
    }

    // Loading State
    pane.innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--fg-muted);">Loading...</div>';

    let html = '';

    if (activeTab.slug === 'home' || activeTab.title.toLowerCase() === 'home') {
        html = await renderHome();
    } else if (activeTab.slug === 'about') {
        html = await renderAbout();
    } else if (activeTab.slug === 'projects') {
        html = await renderProjects();
    } else if (activeTab.slug === 'skills') {
        html = await renderSkills();
    } else if (activeTab.slug === 'education') {
        html = await renderEducation();
    } else if (activeTab.slug === 'contact') {
        html = await renderContact();
    } else {
        // Fallback to legacy Markdown renderer if any other dynamic route is triggered
        const sectionData = await api.getSection(activeTab.slug);
        if (!sectionData) {
            html = '<div style="color:red;padding:2rem;">Failed to load content.</div>';
        } else if (sectionData.content) {
            if (window.marked) {
                html = `<div style="padding:2rem;max-width:800px;">${window.marked.parse(sectionData.content)}</div>`;
            } else {
                html = `<div style="padding:2rem;max-width:800px;"><pre>${sectionData.content}</pre></div>`;
            }
        } else {
            html = '<div style="padding:2rem;"><i>No content available.</i></div>';
        }
    }

    contentCache[activeTab.id] = html;
    pane.innerHTML = html;
}
