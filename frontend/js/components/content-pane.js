// components/content-pane.js - Renders the content of the active tab
import { state } from '../core/state.js';
import { api } from '../core/api.js';
import { renderProjects } from './project-card.js';
import { renderSkills } from './skills-view.js';

// The static HTML for the home page so we don't lose it
const HOME_STATIC_HTML = `
<div class="home-content">
    <div class="home-comment">// main.py</div>
    <h1 class="home-title">Mohamed Ibrahim Y</h1>
    <h2 class="home-tagline">Building real, working software 🚀</h2>
    
    <div class="home-badges">
        <span class="badge">Backend Developer</span>
        <span class="badge">Full-Stack</span>
        <span class="badge">Freelancer & Educator</span>
        <span class="badge">Final-Year CSE</span>
    </div>
    
    <p class="home-intro">I build and ship real software — REST APIs, CI/CD pipelines, and full-stack apps that go from my machine to a live URL.</p>
    
    <div class="home-ctas">
        <button class="cta-button primary" onclick="alert('Navigate to Projects')">Projects</button>
        <button class="cta-button" onclick="alert('Navigate to About Me')">About Me</button>
        <button class="cta-button" onclick="alert('Navigate to Contact')">Contact</button>
    </div>
    
    <div class="home-stats">
        <div class="stat-block">
            <span class="stat-value">4+</span>
            <span class="stat-label">Projects Shipped</span>
        </div>
        <div class="stat-block">
            <span class="stat-value">13</span>
            <span class="stat-label">Themes</span>
        </div>
        <div class="stat-block">
            <span class="stat-value">100%</span>
            <span class="stat-label">Backend Tests Passing</span>
        </div>
        <div class="stat-block">
            <span class="stat-value">∞</span>
            <span class="stat-label">Curiosity</span>
        </div>
    </div>
</div>
`;

// Cache to avoid re-fetching content for the same tab repeatedly
const contentCache = {};

export async function renderContent() {
    const pane = document.querySelector('.content-pane');
    const activeTab = state.getActiveTab();

    if (!activeTab) {
        pane.innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;color:var(--fg-muted);">No file is open</div>';
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

    // Check cache
    if (contentCache[activeTab.id]) {
        pane.innerHTML = contentCache[activeTab.id];
        return;
    }

    pane.innerHTML = '<div style="color:var(--fg-muted);">Loading...</div>';

    // Fetch markdown/content for standard sections
    const sectionData = await api.getSection(activeTab.slug);
    if (!sectionData) {
        pane.innerHTML = '<div style="color:red;">Failed to load content.</div>';
        return;
    }

    let parsedHtml = '';
    if (sectionData.content) {
        // Use marked.js if available (loaded via CDN in index.html)
        if (window.marked) {
            parsedHtml = window.marked.parse(sectionData.content);
        } else {
            parsedHtml = `<pre>${sectionData.content}</pre>`; // Fallback
        }
    } else {
        parsedHtml = '<i>No content available.</i>';
    }

    contentCache[activeTab.id] = parsedHtml;
    pane.innerHTML = parsedHtml;
}
