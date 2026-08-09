import { api } from '../core/api.js';

export async function renderAbout() {
    const config = await api.getPageConfig('about');
    
    if (!config) {
        return '<div style="color:red;padding:2rem;">Failed to load About configuration.</div>';
    }

    const aboutMeHtml = config.about_me 
        ? (window.marked ? window.marked.parse(config.about_me) : `<pre>${config.about_me}</pre>`)
        : '';

    const currentFocusHtml = config.current_focus && config.current_focus.length > 0
        ? `<div class="about-section">
            <h3 style="color: var(--fg-active); margin-bottom: 10px;">Currently Focusing On</h3>
            <ul style="list-style-type: none; padding-left: 0;">
                ${config.current_focus.map(f => `<li style="margin-bottom: 8px;"><span style="margin-right: 10px;">${f.emoji}</span> ${f.text}</li>`).join('')}
            </ul>
           </div>`
        : '';

    const currentlyLearningHtml = config.currently_learning && config.currently_learning.length > 0
        ? `<div class="about-section" style="margin-top: 1.5rem;">
            <h3 style="color: var(--fg-active); margin-bottom: 10px;">Currently Learning</h3>
            <ul style="list-style-type: none; padding-left: 0;">
                ${config.currently_learning.map(f => `<li style="margin-bottom: 8px;"><span style="margin-right: 10px;">${f.emoji}</span> ${f.text}</li>`).join('')}
            </ul>
           </div>`
        : '';

    return `
<div class="about-content" style="padding: 2rem; max-width: 800px; color: var(--fg-default);">
    <div class="home-comment" style="color: var(--fg-muted); margin-bottom: 1rem;">${config.top_text || '// about me'}</div>
    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--fg-active);">${config.big_text || 'About Me'}</h1>
    <h2 style="font-size: 1.2rem; color: var(--fg-muted); margin-bottom: 2rem; font-weight: normal;">${config.tagline || ''}</h2>
    
    <div class="about-me-markdown" style="line-height: 1.6; margin-bottom: 2.5rem;">
        ${aboutMeHtml}
    </div>
    
    ${currentFocusHtml}
    ${currentlyLearningHtml}
</div>
    `;
}
