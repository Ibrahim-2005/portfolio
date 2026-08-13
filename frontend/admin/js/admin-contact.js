import { adminApi } from './admin-api.js';

let isInitialized = false;
let contactLinks = [];

export async function initContactEditor() {
    if (isInitialized) return;
    isInitialized = true;

    const formConfig = document.getElementById('form-contact-config');
    const formLinkEdit = document.getElementById('form-contact-link-edit');
    if (!formConfig || !formLinkEdit) return;

    // Load data
    await loadContactConfig();
    await loadContactLinks();

    // Config form listener
    formConfig.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveContactConfig();
    });

    // Link CRUD setup
    document.getElementById('btn-add-contact-link').addEventListener('click', () => {
        openLinkEditor(null);
    });

    document.getElementById('btn-cancel-contact-link').addEventListener('click', () => {
        closeLinkEditor();
    });

    formLinkEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveContactLink();
    });

    document.getElementById('btn-upload-contact-logo').addEventListener('click', async () => {
        const fileInput = document.getElementById('contact-link-logo-input');
        if (!fileInput.files.length) return alert('Please select a file first.');
        const id = document.getElementById('contact-link-id').value;
        if (!id) return alert('Please save the link first before uploading a logo.');

        if (window.setLoading) window.setLoading(true);
        try {
            const result = await adminApi.uploadContactLinkIcon(id, fileInput.files[0]);
            if (window.showToast) window.showToast('Logo uploaded successfully.');
            const link = contactLinks.find(l => l.id == id);
            if (link) link.has_uploaded_icon = true;
            fileInput.value = '';
            updateUploadPreview(id, true, result.icon_url);
            await loadContactLinks();
        } catch (err) {
            if (window.showToast) window.showToast('Failed to upload logo: ' + err.message, 'error');
        } finally {
            if (window.setLoading) window.setLoading(false);
        }
    });

    document.getElementById('btn-remove-contact-logo').addEventListener('click', async () => {
        const id = document.getElementById('contact-link-id').value;
        if (!id) return;

        if (!confirm('Are you sure you want to remove the uploaded logo?')) return;
        if (window.setLoading) window.setLoading(true);
        try {
            await adminApi.deleteContactLinkIcon(id);
            if (window.showToast) window.showToast('Logo removed successfully.');
            const link = contactLinks.find(l => l.id == id);
            if (link) link.has_uploaded_icon = false;
            updateUploadPreview(id, false, null);
            await loadContactLinks();
        } catch (err) {
            if (window.showToast) window.showToast('Failed to remove logo: ' + err.message, 'error');
        } finally {
            if (window.setLoading) window.setLoading(false);
        }
    });
}

async function loadContactConfig() {
    try {
        const config = await adminApi.getContactConfig() || {};
        document.getElementById('contact-top-text').value = config.top_text || '';
        document.getElementById('contact-heading').value = config.heading || '';
        document.getElementById('contact-tagline').value = config.tagline || '';
        document.getElementById('contact-form-footer-text').value = config.form_footer_text || '';
    } catch (err) {
        console.error('Failed to load contact config:', err);
    }
}

async function saveContactConfig() {
    if (window.setLoading) window.setLoading(true);
    
    try {
        const payload = {
            top_text: document.getElementById('contact-top-text').value.trim() || null,
            heading: document.getElementById('contact-heading').value.trim() || null,
            tagline: document.getElementById('contact-tagline').value.trim() || null,
            form_footer_text: document.getElementById('contact-form-footer-text').value.trim() || null
        };
        
        await adminApi.updateContactConfig(payload);
        if (window.showToast) window.showToast('Contact config updated successfully.');
    } catch (err) {
        if (window.showToast) window.showToast('Failed to update config: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function loadContactLinks() {
    const listContainer = document.getElementById('contact-links-list-container');
    listContainer.innerHTML = '<div style="padding: 1rem; text-align: center;">Loading links...</div>';
    
    try {
        contactLinks = await adminApi.getContactLinks() || [];
        listContainer.innerHTML = '';
        
        if (contactLinks.length === 0) {
            listContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: #666;">No contact links found.</div>';
            return;
        }

        contactLinks.forEach(link => {
            const div = document.createElement('div');
            div.className = 'dynamic-list-item';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '0.75rem';
            div.style.borderBottom = '1px solid var(--border-color)';
            
            const enabledBadge = link.enabled ? 
                '<span style="background: #28a745; color: white; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.75rem;">Enabled</span>' : 
                '<span style="background: #6c757d; color: white; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.75rem;">Disabled</span>';

            div.innerHTML = `
                <div>
                    <h4 style="margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        ${escapeHtml(link.platform)} ${enabledBadge}
                    </h4>
                    <span style="font-size: 0.85rem; color: #666;">${escapeHtml(link.url)} (Order: ${link.sort_order})</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" class="btn btn-sm btn-secondary btn-edit">Edit</button>
                    <button type="button" class="btn btn-sm btn-danger btn-delete">Delete</button>
                </div>
            `;

            div.querySelector('.btn-edit').addEventListener('click', () => openLinkEditor(link));
            div.querySelector('.btn-delete').addEventListener('click', () => deleteContactLink(link.id, link.platform));

            listContainer.appendChild(div);
        });
    } catch (err) {
        console.error('Failed to load contact links:', err);
        listContainer.innerHTML = `<div style="padding: 1rem; color: red;">Failed to load links.</div>`;
    }
}

function openLinkEditor(link) {
    const formConfig = document.getElementById('form-contact-config');
    const linksView = document.getElementById('contact-links-list-view');
    const formEdit = document.getElementById('form-contact-link-edit');
    const title = document.getElementById('contact-link-edit-title');

    formConfig.classList.add('hidden');
    linksView.classList.add('hidden');
    formEdit.classList.remove('hidden');

    if (link) {
        title.textContent = 'Edit Contact Link';
        document.getElementById('contact-link-id').value = link.id;
        document.getElementById('contact-link-platform').value = link.platform || '';
        document.getElementById('contact-link-url').value = link.url || '';
        document.getElementById('contact-link-icon').value = link.icon || '';
        document.getElementById('contact-link-sort-order').value = link.sort_order || 0;
        document.getElementById('contact-link-enabled').checked = link.enabled;
        document.getElementById('contact-link-upload-section').style.display = 'block';
        updateUploadPreview(link.id, link.has_uploaded_icon, link.icon_url);
    } else {
        title.textContent = 'Add Contact Link';
        document.getElementById('contact-link-id').value = '';
        document.getElementById('contact-link-platform').value = '';
        document.getElementById('contact-link-url').value = '';
        document.getElementById('contact-link-icon').value = '';
        document.getElementById('contact-link-sort-order').value = 0;
        document.getElementById('contact-link-enabled').checked = true;
        document.getElementById('contact-link-upload-section').style.display = 'block';
        updateUploadPreview(null, false, null);
    }
}

function updateUploadPreview(id, hasIcon, iconUrl) {
    const previewContainer = document.getElementById('contact-link-logo-preview-container');
    const previewImg = document.getElementById('contact-link-logo-preview');
    const removeBtn = document.getElementById('btn-remove-contact-logo');

    if (iconUrl) {
        previewImg.src = iconUrl;
        previewContainer.style.display = 'block';
        removeBtn.style.display = 'inline-block';
    } else if (hasIcon) {
        previewImg.src = `/api/contact-links/${id}/icon?t=${Date.now()}`;
        previewContainer.style.display = 'block';
        removeBtn.style.display = 'inline-block';
    } else {
        previewImg.src = '';
        previewContainer.style.display = 'none';
        removeBtn.style.display = 'none';
    }
}

function closeLinkEditor() {
    document.getElementById('form-contact-config').classList.remove('hidden');
    document.getElementById('contact-links-list-view').classList.remove('hidden');
    document.getElementById('form-contact-link-edit').classList.add('hidden');
}

async function saveContactLink() {
    if (window.setLoading) window.setLoading(true);
    
    try {
        const id = document.getElementById('contact-link-id').value;
        const payload = {
            platform: document.getElementById('contact-link-platform').value.trim(),
            url: document.getElementById('contact-link-url').value.trim(),
            icon: document.getElementById('contact-link-icon').value.trim() || null,
            sort_order: parseInt(document.getElementById('contact-link-sort-order').value, 10) || 0,
            enabled: document.getElementById('contact-link-enabled').checked
        };

        if (id) {
            await adminApi.updateContactLink(id, payload);
            if (window.showToast) window.showToast('Link updated successfully.');
        } else {
            const created = await adminApi.createContactLink(payload);
            if (window.showToast) window.showToast('Link created successfully.');
            // Allow them to upload a logo now
            const fileInput = document.getElementById('contact-link-logo-input');
            if (fileInput.files.length) {
                await adminApi.uploadContactLinkIcon(created.id, fileInput.files[0]);
                if (window.showToast) window.showToast('Logo uploaded automatically.');
                fileInput.value = '';
            }
        }

        closeLinkEditor();
        await loadContactLinks();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save link: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function deleteContactLink(id, platform) {
    if (!confirm(`Are you sure you want to delete link "${platform}"?`)) return;
    
    if (window.setLoading) window.setLoading(true);
    try {
        await adminApi.deleteContactLink(id);
        if (window.showToast) window.showToast('Link deleted successfully.');
        await loadContactLinks();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to delete link: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return (unsafe + '')
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
