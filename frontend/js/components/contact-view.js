import { api } from '../core/api.js';

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return (unsafe + '')
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

export async function renderContact() {
    const [config, links] = await Promise.all([
        api.getPageConfig('contact'),
        api.getContactLinks()
    ]);
    
    if (!config) {
        return '<div style="color:red;padding:2rem;">Failed to load Contact configuration.</div>';
    }

    const enabledLinks = (links || []).filter(l => l.enabled).sort((a,b) => a.sort_order - b.sort_order);
    let linksHtml = '';

    if (enabledLinks.length > 0) {
        linksHtml = '<div class="contact-cards-grid">';
        enabledLinks.forEach(l => {
            let iconHtml = '<div class="contact-card-icon empty"></div>';

            if (l.icon_url) {
                iconHtml = `<img src="${escapeHtml(l.icon_url)}" alt="${escapeHtml(l.platform)} logo" class="contact-card-icon" />`;
            } else if (l.has_uploaded_icon) {
                iconHtml = `<img src="/api/contact-links/${l.id}/icon" alt="${escapeHtml(l.platform)} logo" class="contact-card-icon" />`;
            } else if (l.icon) {
                if (l.icon.startsWith('http')) {
                    iconHtml = `<img src="${escapeHtml(l.icon)}" alt="${escapeHtml(l.platform)} logo" class="contact-card-icon" />`;
                } else if (l.icon.includes('<svg')) {
                    iconHtml = `<div class="contact-card-icon svg-wrapper">${l.icon}</div>`;
                } else {
                    iconHtml = `<div class="contact-card-icon text-icon">${escapeHtml(l.icon)}</div>`;
                }
            }

            let displayUrl = l.url;
            try {
                const urlObj = new URL(l.url);
                displayUrl = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
                displayUrl = displayUrl.replace(/\/$/, '');
            } catch (e) {
                // Keep raw URL if it doesn't parse
            }

            linksHtml += `
                <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" class="contact-card">
                    <div class="contact-card-icon-wrapper">${iconHtml}</div>
                    <div class="contact-card-content">
                        <div class="contact-card-platform">${escapeHtml(l.platform)} <span class="external-icon">↗</span></div>
                        <div class="contact-card-url">${escapeHtml(displayUrl)}</div>
                    </div>
                </a>
            `;
        });
        linksHtml += '</div>';
    } else {
        linksHtml = '<p style="color: var(--fg-muted);">No contact links available.</p>';
    }

    return `
<div class="contact-container">
    <div class="contact-header">
        <div class="contact-top-text">${escapeHtml(config.top_text) || '// contact'}</div>
        <h1 class="contact-heading">${escapeHtml(config.heading) || 'Get in Touch'}</h1>
        ${config.tagline ? `<h2 class="contact-tagline">${escapeHtml(config.tagline)}</h2>` : ''}
    </div>

    <div class="contact-layout">
        <div class="contact-column">
            <h3 class="contact-column-title">FIND ME ON</h3>
            ${linksHtml}
        </div>

        <div class="contact-column">
            <h3 class="contact-column-title">SEND A MESSAGE</h3>
            <div class="contact-form-section">
                <form id="public-contact-form" class="contact-form" onsubmit="window.submitContactForm(event)">
                    <div class="contact-form-group">
                        <label class="contact-form-label" for="contact-name">// YOUR_NAME <span class="required">*</span></label>
                        <input type="text" id="contact-name" name="name" class="contact-form-input" required />
                    </div>

                    <div class="contact-form-group">
                        <label class="contact-form-label" for="contact-email">// YOUR_EMAIL <span class="required">*</span></label>
                        <input type="email" id="contact-email" name="email" class="contact-form-input" required />
                    </div>

                    <div class="contact-form-group">
                        <label class="contact-form-label" for="contact-subject">// SUBJECT</label>
                        <input type="text" id="contact-subject" name="subject" class="contact-form-input" />
                    </div>

                    <div class="contact-form-group">
                        <label class="contact-form-label" for="contact-message">// MESSAGE <span class="required">*</span></label>
                        <textarea id="contact-message" name="message" class="contact-form-textarea" required></textarea>
                    </div>

                    <button type="submit" id="contact-submit-btn" class="contact-form-submit">[ → send_message() ]</button>
                    <div id="contact-form-feedback" class="contact-form-feedback"></div>
                </form>
                ${config.form_footer_text ? `<div class="contact-form-footer">${escapeHtml(config.form_footer_text)}</div>` : ''}
            </div>
        </div>
    </div>
</div>
    `;
}

// Global handler for contact form submission
window.submitContactForm = async function(e) {
    e.preventDefault();

    const form = e.target;
    const btn = document.getElementById('contact-submit-btn');
    const feedback = document.getElementById('contact-form-feedback');

    // Read fields matching existing schema (MessageCreate expects name, email, message)
    // We can also prepend the subject to the message if needed since the model only has 'message'
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    let messageBody = document.getElementById('contact-message').value.trim();

    if (subject) {
        messageBody = `Subject: ${subject}\n\n${messageBody}`;
    }

    const payload = {
        name: name,
        email: email,
        message: messageBody
    };

    btn.disabled = true;
    btn.textContent = '[ sending... ]';
    feedback.textContent = '';
    feedback.className = 'contact-form-feedback';

    try {
        await api.submitContactMessage(payload);

        feedback.textContent = 'Message sent successfully!';
        feedback.classList.add('success');

        // Use existing toast if available
        if (window.showToast) {
            window.showToast('Message sent successfully!');
        }

        form.reset();
    } catch (err) {
        console.error(err);
        feedback.textContent = err.message || 'Failed to send message. Please try again.';
        feedback.classList.add('error');
    } finally {
        btn.disabled = false;
        btn.textContent = '[ → send_message() ]';
    }
};
