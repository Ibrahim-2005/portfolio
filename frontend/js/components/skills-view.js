// components/skills-view.js - Fetches and renders skills by category
import { api } from '../core/api.js';

export async function renderSkills() {
    const skillsGroups = await api.getSkills();
    
    if (!skillsGroups) {
        return '<div style="color:red;">Failed to load skills.</div>';
    }
    
    if (skillsGroups.length === 0) {
        return '<i>No skills found.</i>';
    }

    let html = '<div class="skills-container" style="max-width: 800px;">';
    
    skillsGroups.forEach(group => {
        html += `<h2 style="margin-top: 1.5em; margin-bottom: 0.8em; font-size: 1.4rem; color: var(--fg-active);">${group.category}</h2>`;
        html += '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
        
        group.items.forEach(item => {
            const iconHtml = item.icon ? `<span style="margin-right: 5px;">${item.icon}</span>` : '';
            html += `<span class="project-tag" style="font-size: 13px; padding: 4px 12px; cursor: default;" title="Proficiency: ${item.proficiency}">${iconHtml}${item.name}</span>`;
        });
        
        html += '</div>';
    });
    
    html += '</div>';
    return html;
}
