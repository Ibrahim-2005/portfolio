import { api, API_BASE_URL } from "../core/api.js";

export async function renderResume() {
    let config;
    try {
        config = await api.getPageConfig("resume");
    } catch (err) {
        console.error("Failed to load resume config:", err);
    }

    if (!config) {
        return `
            <div class="about-page-container">
                <div class="about-page-comment">// error</div>
                <h1 class="about-page-heading">Error</h1>
                <h2 class="about-page-tagline">Unable to load resume.</h2>
            </div>
        `;
    }

    const topText = config.top_text || "// resume";
    const heading = config.heading || "Resume";
    const tagline = config.tagline || "";
    const resumeUrl = `${API_BASE_URL}/resume`;

    // Handle explicit hr similar to other pages
    const divider = tagline
        ? `<hr class="page-divider" style="height: 1px; padding: 0; margin: 1.25rem 0 1rem 0; background-color: color-mix(in srgb, var(--accent) 30%, var(--border-default)); border: 0;" />`
        : `<hr class="page-divider" style="height: 1px; padding: 0; margin: 0 0 1rem 0; background-color: color-mix(in srgb, var(--accent) 30%, var(--border-default)); border: 0;" />`;

    // Check if the resume PDF exists
    let hasResume = false;
    try {
        const headRes = await fetch(resumeUrl, { method: 'HEAD' });
        if (headRes.ok) {
            hasResume = true;
        }
    } catch (e) {
        console.warn("Failed to check resume existence", e);
    }

    let resumeContentHtml = '';

    if (hasResume) {
        resumeContentHtml = `
            <div class="resume-actions">
                <a href="${resumeUrl}" target="_blank" class="cta-button secondary" rel="noopener noreferrer">Open PDF ↗</a>
                <a href="${resumeUrl}" download="Resume.pdf" class="cta-button primary">Download PDF ↓</a>
            </div>

            <div class="resume-preview-container">
                <iframe
                    src="${resumeUrl}"
                    class="resume-iframe"
                    title="Resume PDF Preview"
                    onerror="this.style.display='none'; document.getElementById('resume-error').style.display='flex';"
                ></iframe>
                <div id="resume-error" class="resume-error-state" style="display: none;">
                    <p style="color: var(--fg-muted);">Unable to load PDF preview.</p>
                    <a href="${resumeUrl}" download class="cta-button primary" style="margin-top: 1rem;">Download PDF Instead</a>
                </div>
            </div>
        `;
    } else {
        resumeContentHtml = `
            <div class="resume-error-state" style="padding: 4rem 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📄</div>
                <h3 style="color: var(--fg-active); margin-bottom: 0.5rem;">No resume available</h3>
                <p style="color: var(--fg-muted);">The resume PDF has not been uploaded yet.</p>
            </div>
        `;
    }

    return `
<div class="about-page-container">
    <div class="about-page-comment">${topText}</div>
    <h1 class="about-page-heading">${heading}</h1>
    <h2 class="about-page-tagline">${tagline}</h2>
    ${divider}

    <div class="resume-card">
        ${resumeContentHtml}
    </div>
</div>
    `;
}
