// components/skills-view.js - Fetches and renders skills by category
import { api } from '../core/api.js';

export async function renderSkills() {
    const [skillsGroups, config] = await Promise.all([
        api.getSkills(),
        api.getPageConfig('skills')
    ]);
    
    if (!skillsGroups) {
        return '<div style="color:red;">Failed to load skills.</div>';
    }
    
    let html = '<div class="skills-container" style="max-width: 900px;">';

    if (config) {
        html += `
            <div class="skills-header">
                ${config.top_text ? `<div class="skills-top-text">${config.top_text}</div>` : ''}
                ${config.heading ? `<h1 class="skills-heading">${config.heading}</h1>` : ''}
                ${config.tagline ? `<h2 class="skills-tagline">${config.tagline}</h2>` : ''}
            </div>
            <div class="skills-separator"></div>
        `;
    }

    if (skillsGroups.length === 0) {
        html += '<i>No skills found.</i>';
    } else {
        html += '<div class="skills-grid">';
        
        skillsGroups.forEach(group => {
            html += `
                <div class="skill-category">
                    <h3 class="skill-category-title">${group.category}</h3>
                    <div class="skill-category-separator"></div>
                    <div class="skill-list">
            `;

            group.items.forEach(item => {
                const percent = item.proficiency || 0;
                html += `
                    <div class="skill-row">
                        <div class="skill-name" title="${item.name}">${item.name}</div>
                        <div class="skill-bar-container">
                            <div class="skill-bar-fill" style="width: ${percent}%;"></div>
                        </div>
                        <div class="skill-percent">${percent}%</div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}
