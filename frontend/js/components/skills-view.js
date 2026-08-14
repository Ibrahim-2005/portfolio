// components/skills-view.js - Fetches and renders skills by category
import { api } from "../core/api.js";

export async function renderSkills() {
  const [skillsGroups, config] = await Promise.all([
    api.getSkills(),
    api.getPageConfig("skills"),
  ]);

  if (!skillsGroups) {
    return '<div style="color:red;">Failed to load skills.</div>';
  }

  let html = '<div class="skills-container">';

  if (config) {
    html += `
            <div class="skills-header">
                <div class="skills-header-content">
                    ${config.top_text ? `<div class="skills-top-text">${config.top_text}</div>` : ""}
                    ${config.heading ? `<h1 class="skills-heading">${config.heading}</h1>` : ""}
                    ${config.tagline ? `<p class="skills-tagline">${config.tagline}</p>` : ""}
                </div>
            </div>

            <div class="skills-legend-panel">
                <div class="skills-legend-title">HOW I RATE MY SKILLS</div>
                <dl class="skills-legend-grid">
                    <div class="skills-legend-item">
                        <dt class="legend-core-text"><span class="legend-dot dot-core"></span>Core</dt>
                        <dd>Technologies and practices I use regularly and can work with.</dd>
                    </div>
                    <div class="skills-legend-item">
                        <dt class="legend-hands-on-text"><span class="legend-dot dot-hands-on"></span>Hands-on</dt>
                        <dd>Technologies and practices I've used directly in projects and can work with practically.</dd>
                    </div>
                    <div class="skills-legend-item">
                        <dt class="legend-working-text"><span class="legend-dot dot-working"></span>Working</dt>
                        <dd>Technologies I'm actively learning and can work with at a foundational level.</dd>
                    </div>
                </dl>
            </div>
        `;
  }

  if (skillsGroups.length === 0) {
    html += "<i>No skills found.</i>";
  } else {
    html += '<div class="skills-grid">';

    const iconMap = {
      'backend': '&lt;/&gt;',
      'databases': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
      'frontend': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
      'testing-delivery': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2v4.5L3 18.5A2 2 0 0 0 4.5 22h15a2 2 0 0 0 1.5-3.5L15 6.5V2"></path><path d="M9 2h6"></path><path d="M3 15h18"></path></svg>',
      'engineering-practices': '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
    };

    skillsGroups.forEach((group) => {
      const categorySlug = group.category.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const icon = iconMap[categorySlug] || '&lt;/&gt;';

      html += `
        <section class="skill-category-card category-${categorySlug}">

            <div class="skill-category-header">
                <h2 class="skill-category-title">
                    <span class="skill-category-icon">${icon}</span>
                    ${escapeHtml(group.category)}
                </h2>

                <span class="skill-category-count">
                    ${String(group.sort_order).padStart(2, "0")}
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

                <span class="skill-level-badge level-${String(item.level)
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "-")}">
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

    html += "</div>";
  }

  html += "</div>";
  return html;
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";

  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
