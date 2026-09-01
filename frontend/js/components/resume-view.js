import { api, API_BASE_URL } from "../core/api.js";

async function ensurePdfJsLoaded() {
    if (window.pdfjsLib) return window.pdfjsLib;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/assets/vendor/pdfjs/pdf.min.js';
        script.onload = () => {
            if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdfjs/pdf.worker.min.js';
                resolve(window.pdfjsLib);
            } else {
                reject(new Error('pdfjsLib not found on window'));
            }
        };
        script.onerror = () => {
            // Fallback to CDN if local fails
            const cdnScript = document.createElement('script');
            cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            cdnScript.onload = () => {
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    resolve(window.pdfjsLib);
                } else {
                    reject(new Error('pdfjsLib CDN load failed'));
                }
            };
            cdnScript.onerror = (e) => reject(e);
            document.head.appendChild(cdnScript);
        };
        document.head.appendChild(script);
    });
}

export async function initResumeViewer(resumeUrl = `${API_BASE_URL}/resume`) {
    const isMobile = window.innerWidth <= 599;
    const canvasContainer = document.getElementById('resume-canvas-container');
    const iframe = document.querySelector('.desktop-resume-iframe');
    const errorState = document.getElementById('resume-error');

    if (!canvasContainer) return;

    if (!isMobile) {
        if (iframe) iframe.style.display = 'block';
        canvasContainer.style.display = 'none';
        return;
    }

    // On phone (<=599px), render PDF onto Canvas using PDF.js
    if (iframe) iframe.style.display = 'none';
    canvasContainer.style.display = 'flex';

    try {
        const pdfjs = await ensurePdfJsLoaded();
        const loadingTask = pdfjs.getDocument(resumeUrl);
        const pdf = await loadingTask.promise;

        canvasContainer.innerHTML = '';
        const containerWidth = canvasContainer.clientWidth || (window.innerWidth - 40);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            const scale = (containerWidth / unscaledViewport.width);
            const dpr = window.devicePixelRatio || 1;
            const viewport = page.getViewport({ scale: scale * dpr });

            const canvas = document.createElement('canvas');
            canvas.className = 'resume-page-canvas';
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            canvas.style.width = '100%';
            canvas.style.height = 'auto';

            const ctx = canvas.getContext('2d');
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            await page.render(renderContext).promise;
            canvasContainer.appendChild(canvas);
        }
    } catch (err) {
        console.error('Failed to render mobile PDF canvas:', err);
        if (canvasContainer) canvasContainer.style.display = 'none';
        if (errorState) errorState.style.display = 'flex';
    }
}

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

            <div class="resume-preview-container" id="resume-preview-container">
                <iframe
                    src="${resumeUrl}"
                    class="resume-iframe desktop-resume-iframe"
                    title="Resume PDF Preview"
                    onerror="this.style.display='none'; document.getElementById('resume-error').style.display='flex';"
                ></iframe>
                <div id="resume-canvas-container" class="resume-canvas-container" style="display: none;">
                    <div class="resume-loading-indicator" id="resume-loading-indicator">
                        <span class="resume-loading-spinner"></span>
                        <span>Loading resume...</span>
                    </div>
                </div>
                <div id="resume-error" class="resume-error-state" style="display: none;">
                    <p style="color: var(--fg-muted);">Unable to load PDF preview.</p>
                    <a href="${resumeUrl}" download class="cta-button primary" style="margin-top: 1rem;">Download PDF Instead</a>
                </div>
            </div>
        `;

        setTimeout(() => {
            initResumeViewer(resumeUrl);
        }, 0);
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
