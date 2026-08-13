// components/skills-view.js - Fetches and renders skills by category
import { api } from '../core/api.js';

export async function renderSkills() {
    const [skillsGroups, config] = await Promise.all([
        api.getSkills(),
        api.getPageConfig('skills'),
    ]);

    if (!skillsGroups) {
        return '<div style="color:red;">Failed to load skills.</div>';
    }

    let html = '<div class="skills-container">';

    if (config) {
        html += `
            <div class="skills-header">
                <div class="skills-header-left">
                    ${config.top_text ? `<div class="skills-top-text">${config.top_text}</div>` : ''}
                    ${config.heading ? `<h1 class="skills-heading">${config.heading}</h1>` : ''}
                    ${config.tagline ? `<p class="skills-tagline">${config.tagline}</p>` : ''}
                </div>
                <div class="skills-header-right">
                    <div class="skills-legend-title">HOW I RATE MY SKILLS</div>
                    <dl class="skills-legend-list">
                        <div class="skills-legend-item">
                            <dt>Core</dt>
                            <dd>Primary technologies I use regularly and confidently.</dd>
                        </div>
                        <div class="skills-legend-item">
                            <dt>Hands-on</dt>
                            <dd>Technologies and practices I have used directly in projects.</dd>
                        </div>
                        <div class="skills-legend-item">
                            <dt>Working</dt>
                            <dd>Practical exposure with enough familiarity to work with the technology and continue learning.</dd>
                        </div>
                    </dl>
                </div>
            </div>
        `;
    }

    if (skillsGroups.length === 0) {
        html += '<i>No skills found.</i>';
    } else {
        html += '<div class="skills-grid">';

        skillsGroups.forEach((group) => {
            html += `
        <section class="skill-category-card">

            <div class="skill-category-header">
                <h2 class="skill-category-title">
                    <span class="skill-category-icon">&lt;/&gt;</span>
                    ${escapeHtml(group.category)}
                </h2>

                <span class="skill-category-count">
                    ${String(group.sort_order).padStart(2, '0')}
                </span>
            </div>

            <ul class="skill-list">
    `;

            group.items.forEach((item) => {
                html += `
            <li class="skill-row">

                <span
                    class="skill-name"
                    title="${escapeHtml(item.name)}"
                >
                    ${escapeHtml(item.name)}
                </span>

                <span class="skill-level-badge level-${String(item.level).toLowerCase().replace(/[^a-z0-9]/g, '-')}">
                    ${escapeHtml(item.level)}
                </span>

            </li>
        `;
            });

            html += `
            </ul>

        </section>
    `;
        });

        html += '</div>';
    }

    html += '</div>';
    return html;
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';

    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
