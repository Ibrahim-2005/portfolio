// components/project-card.js - Fetches and renders project cards
import { api } from '../core/api.js';

export async function renderProjects() {
    const [projects, config] = await Promise.all([
        api.getProjects(),
        api.getPageConfig('projects')
    ]);
    
    if (!projects) {
        return '<div style="color:red;">Failed to load projects.</div>';
    }

    let html = '<div class="projects-container">';

    if (config) {
        html += `
            <div class="projects-header">
                ${config.top_text ? `<div class="projects-top-text">${config.top_text}</div>` : ''}
                ${config.heading ? `<h1 class="projects-heading">${config.heading}</h1>` : ''}
                ${config.tagline ? `<h2 class="projects-tagline">${config.tagline}</h2>` : ''}
            </div>
        `;
    }

    if (projects.length === 0) {
        html += '<i>No projects found.</i>';
    } else {
        html += '<div class="projects-grid">';
    
    projects.forEach(project => {
        const techStackHtml = project.tech_stack 
            ? project.tech_stack.map(tech => `<span class="project-tag">${tech.icon ? tech.icon + ' ' : ''}${tech.name}</span>`).join('') 
            : '';
            
        const highlightsHtml = project.highlights && project.highlights.length > 0
            ? `<ul class="project-highlights">${project.highlights.map(h => `<li>${h}</li>`).join('')}</ul>`
            : '';

        const linksHtml = `
            <div class="project-links">
                ${project.repo_url ? `<a href="${project.repo_url}" target="_blank" class="project-link">GitHub ↗</a>` : ''}
                ${project.live_url ? `<a href="${project.live_url}" target="_blank" class="project-link primary">Live Demo ↗</a>` : ''}
            </div>
        `;

        html += `
            <div class="project-card">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.description}</p>
                <div class="project-tech-stack">${techStackHtml}</div>
                ${highlightsHtml}
                ${linksHtml}
            </div>
        `;
    });

        html += '</div>';
    }

    html += '</div>';
    return html;
}
