import { api } from '../core/api.js';

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function parseMd(text) {
    if (!text) return '';
    const highlighted = text.replace(/==(.*?)==/g, '<span class="highlight">$1</span>');
    if (window.marked && window.DOMPurify) {
        return window.DOMPurify.sanitize(window.marked.parse(highlighted));
    }
    if (window.marked) {
        return window.marked.parse(highlighted);
    }
    return `<p>${highlighted.replace(/\n/g, '<br>')}</p>`;
}

export async function renderEducation() {
    const educationList = await api.getEducation();

    if (!educationList) {
        return `
            <div class="education-container">
                <div class="education-header">
                    <div class="education-top-text">// academic background</div>
                    <h1 class="education-heading">Education</h1>
                    <p class="education-tagline">Academic degrees, qualifications, and continuous learning journey.</p>
                </div>
                <div class="education-error-state">
                    Failed to load education data. Please verify your connection or try again later.
                </div>
            </div>
        `;
    }

    if (educationList.length === 0) {
        return `
            <div class="education-container">
                <div class="education-header">
                    <div class="education-top-text">// academic background</div>
                    <h1 class="education-heading">Education</h1>
                    <p class="education-tagline">Academic degrees, qualifications, and continuous learning journey.</p>
                </div>
                <div class="education-empty-state">
                    // No education records currently listed.
                </div>
            </div>
        `;
    }

    const currentYear = new Date().getFullYear();

    let html = `
        <div class="education-container">
            <div class="education-header">
                <div class="education-top-text">// academic background</div>
                <h1 class="education-heading">Education</h1>
                <p class="education-tagline">Academic degrees, qualifications, and continuous learning journey.</p>
            </div>

            <div class="education-timeline">
    `;

    educationList.forEach((edu) => {
        const isCurrent = !edu.end_year || Number(edu.end_year) >= currentYear;
        const dateRange = edu.end_year
            ? `${escapeHtml(edu.start_year)} — ${escapeHtml(edu.end_year)}`
            : `${escapeHtml(edu.start_year)} — Present`;

        const statusBadgeHtml = isCurrent
            ? `<span class="education-status-badge"><span class="status-dot"></span> CURRENT</span>`
            : '';

        const gradeHtml = edu.grade
            ? `
                <div class="education-grade-row">
                    <span class="education-grade-pill">
                        <span class="education-grade-label">Grade / Performance:</span>
                        <span class="education-grade-value">${escapeHtml(edu.grade)}</span>
                    </span>
                </div>
            `
            : '';

        const descHtml = edu.description
            ? `<div class="education-description">${parseMd(edu.description)}</div>`
            : '';

        html += `
            <article class="education-item ${isCurrent ? 'is-current' : ''}">
                <span class="education-node" aria-hidden="true"></span>
                <div class="education-card">
                    <div class="education-card-header">
                        <div class="education-institution-group">
                            <div class="education-institution">${escapeHtml(edu.institution)}</div>
                            <div class="education-badges">
                                ${statusBadgeHtml}
                            </div>
                        </div>
                        <div class="education-dates">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="opacity:0.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <span>${dateRange}</span>
                        </div>
                    </div>

                    <div class="education-qualification">
                        <span class="education-qualification-icon" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                        </span>
                        <span>${escapeHtml(edu.qualification || edu.degree || '')}</span>
                    </div>

                    ${gradeHtml}
                    ${descHtml}
                </div>
            </article>
        `;
    });

    html += `
            </div>
        </div>
    `;

    return html;
}