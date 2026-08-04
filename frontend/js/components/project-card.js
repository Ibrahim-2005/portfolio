// components/project-card.js - Fetches and renders project cards
import { api } from '../core/api.js';

export async function renderProjects() {
    const projects = await api.getProjects();
    
    if (!projects) {
        return '<div style="color:red;">Failed to load projects.</div>';
    }

    if (projects.length === 0) {
        return '<i>No projects found.</i>';
    }

    let html = '<div class="projects-grid">';
    
    projects.forEach(project => {
        const techStackHtml = project.tech_stack 
            ? project.tech_stack.map(tech => `<span class="project-tag">${tech}</span>`).join('') 
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
    return html;
}
