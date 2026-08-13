import { api } from '../core/api.js';

export async function renderProjects() {
    const [projects, config] = await Promise.all([
        api.getProjects(),
        api.getPageConfig('projects'),
    ]);

    if (!projects) {
        return '<div style="color:red;">Failed to load projects.</div>';
    }

    let html = '<div class="projects-container">';

    if (config) {
        html += `
            <div class="projects-header">
                ${
                    config.top_text
                        ? `<div class="projects-top-text">${escapeHtml(config.top_text)}</div>`
                        : ''
                }
                ${
                    config.heading
                        ? `<h1 class="projects-heading">${escapeHtml(config.heading)}</h1>`
                        : ''
                }
                ${
                    config.tagline
                        ? `<p class="projects-tagline">${escapeHtml(config.tagline)}</p>`
                        : ''
                }
            </div>
        `;
    }

    if (projects.length === 0) {
        html += '<i>No projects found.</i>';
    } else {
        html += '<div class="projects-grid">';

        projects.forEach((project, index) => {
            const projectNumber = String(index + 1).padStart(2, '0');

            const techStackHtml = project.tech_stack
                ? project.tech_stack
                      .map(
                          (tech) => `
                            <span class="project-tag">
                                ${tech.icon ? escapeHtml(tech.icon) + ' ' : ''}
                                ${escapeHtml(tech.name)}
                            </span>
                        `,
                      )
                      .join('')
                : '';

            const highlightsHtml =
                project.highlights && project.highlights.length > 0
                    ? `
                        <ul class="project-highlights">
                            ${project.highlights
                                .map(
                                    (highlight) => `
                                        <li>${escapeHtml(highlight)}</li>
                                    `,
                                )
                                .join('')}
                        </ul>
                    `
                    : '';

            const linksHtml =
                project.repo_url || project.live_url
                    ? `
                        <div class="project-links">
                            ${
                                project.live_url
                                    ? `
                                        <a
                                            href="${escapeHtml(project.live_url)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="project-link primary"
                                        >
                                            Live Demo ↗
                                        </a>
                                    `
                                    : ''
                            }

                            ${
                                project.repo_url
                                    ? `
                                        <a
                                            href="${escapeHtml(project.repo_url)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="project-link"
                                        >
                                            GitHub ↗
                                        </a>
                                    `
                                    : ''
                            }
                        </div>
                    `
                    : '';

            html += `
                <article class="project-card">

                    <div class="project-card-header">
                        <div>
                            <h3 class="project-title">
                                ${escapeHtml(project.title)}
                                ${
                                    project.subtitle
                                        ? `
                                            <span class="project-subtitle">
                                                ${escapeHtml(project.subtitle)}
                                            </span>
                                        `
                                        : ''
                                }
                            </h3>
                        </div>

                        <span class="project-number">
                            ${projectNumber}
                        </span>
                    </div>

                    <p class="project-desc">
                        ${escapeHtml(project.description)}
                    </p>

                    ${
                        techStackHtml
                            ? `
                                <div class="project-tech-stack">
                                    ${techStackHtml}
                                </div>
                            `
                            : ''
                    }

                    ${highlightsHtml}

                    ${linksHtml}

                </article>
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
