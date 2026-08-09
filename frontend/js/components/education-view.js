import { api } from '../core/api.js';

export async function renderEducation() {
    const educationList = await api.getEducation();
    
    if (!educationList) {
        return '<div style="color:red;padding:2rem;">Failed to load education.</div>';
    }

    if (educationList.length === 0) {
        return '<div style="padding:2rem;"><i>No education records found.</i></div>';
    }

    let html = '<div class="education-container" style="max-width: 800px; padding: 2rem; color: var(--fg-default);">';
    
    educationList.forEach(edu => {
        const dateRange = edu.end_year ? `${edu.start_year} - ${edu.end_year}` : `${edu.start_year} - Present`;
        const gradeHtml = edu.grade ? `<div style="margin-top: 5px; font-weight: 500; color: var(--fg-active);">Grade: ${edu.grade}</div>` : '';
        const descHtml = edu.description ? `<p style="margin-top: 10px; color: var(--fg-muted); line-height: 1.5;">${edu.description}</p>` : '';
        
        html += `
            <div class="education-item" style="margin-bottom: 2rem; border-left: 2px solid var(--border-color); padding-left: 1rem;">
                <h3 style="color: var(--fg-active); margin-bottom: 5px; font-size: 1.3rem;">${edu.qualification}</h3>
                <div style="font-size: 1.1rem; color: var(--fg-default);">${edu.institution}</div>
                <div style="font-size: 0.9rem; color: var(--fg-muted); margin-top: 5px;">${dateRange}</div>
                ${gradeHtml}
                ${descHtml}
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}
