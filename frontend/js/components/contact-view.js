import { api } from '../core/api.js';

export async function renderContact() {
    const [config, links] = await Promise.all([
        api.getPageConfig('contact'),
        api.getContactLinks()
    ]);
    
    if (!config) {
        return '<div style="color:red;padding:2rem;">Failed to load Contact configuration.</div>';
    }

    const linksHtml = links && links.length > 0 
        ? `<div class="contact-links" style="margin-top: 2rem; display: flex; flex-direction: column; gap: 1rem;">
            ${links.filter(l => l.enabled).sort((a,b) => a.sort_order - b.sort_order).map(l => 
                `<a href="${l.url}" target="_blank" style="color: var(--fg-active); text-decoration: none; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                    <span style="width: 24px; text-align: center;">${l.icon || '🔗'}</span>
                    <span>${l.platform}</span>
                </a>`
            ).join('')}
           </div>`
        : '';

    return `
<div class="contact-content" style="padding: 2rem; max-width: 800px; color: var(--fg-default);">
    <div class="home-comment" style="color: var(--fg-muted); margin-bottom: 1rem;">${config.top_text || '// contact'}</div>
    <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--fg-active);">${config.heading || 'Get in Touch'}</h1>
    <h2 style="font-size: 1.2rem; color: var(--fg-muted); margin-bottom: 2rem; font-weight: normal;">${config.tagline || ''}</h2>
    
    <p style="line-height: 1.6; margin-bottom: 2rem;">
        To send me a direct message, you can use the built-in terminal at the bottom of the screen. 
        Just type <kbd style="background: var(--bg-hover); padding: 2px 6px; border-radius: 4px; font-family: monospace;">contact</kbd> and hit Enter to start the interactive message wizard!
    </p>

    ${linksHtml}
</div>
    `;
}
