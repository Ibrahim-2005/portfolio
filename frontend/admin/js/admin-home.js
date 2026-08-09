import { adminApi } from './admin-api.js';

let isInitialized = false;

export async function initHomeEditor() {
    if (isInitialized) return;
    isInitialized = true;

    const form = document.getElementById('form-home');
    if (!form) return;

    // Load data on init
    await loadHomeData();

    // Setup dynamic list buttons
    document.getElementById('btn-add-role').addEventListener('click', () => {
        addRoleField('', '');
    });
    
    document.getElementById('btn-add-social').addEventListener('click', () => {
        addSocialField('', '', '', true);
    });

    // Handle submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveHomeData();
    });
}

async function loadHomeData() {
    if (window.setLoading) window.setLoading(true);
    try {
        const data = await adminApi.getHomeConfig();
        if (!data) return;

        // Populate fields
        document.getElementById('home-top-text').value = data.top_text || '';
        document.getElementById('home-name').value = data.name || '';
        document.getElementById('home-tagline').value = data.tagline || '';
        document.getElementById('home-intro').value = data.intro || '';
        
        document.getElementById('home-action-projects').value = data.action_projects_label || '';
        document.getElementById('home-action-about').value = data.action_about_label || '';
        document.getElementById('home-action-contact').value = data.action_contact_label || '';

        // Populate roles
        const rolesContainer = document.getElementById('home-roles-container');
        rolesContainer.innerHTML = '';
        (data.roles || []).forEach(role => addRoleField(role.label, role.icon));

        // Populate social links
        const socialsContainer = document.getElementById('home-socials-container');
        socialsContainer.innerHTML = '';
        // Sort social links by sort_order
        const sortedSocials = [...(data.social_links || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        sortedSocials.forEach(s => addSocialField(s.platform, s.url, s.icon, s.enabled));

    } catch (err) {
        if (window.showToast) window.showToast('Failed to load Home config: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

function addRoleField(label, icon) {
    const container = document.getElementById('home-roles-container');
    const div = document.createElement('div');
    div.className = 'dynamic-list-item';
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.alignItems = 'center';

    div.innerHTML = `
        <input type="text" class="role-icon" placeholder="Icon (e.g. 💻)" value="${icon}" required style="width: 100px;">
        <input type="text" class="role-label" placeholder="Label (e.g. Developer)" value="${label}" required style="flex: 1;">
        <button type="button" class="btn btn-sm btn-danger btn-remove">X</button>
    `;

    div.querySelector('.btn-remove').addEventListener('click', () => {
        div.remove();
    });

    container.appendChild(div);
}

function addSocialField(platform, url, icon, enabled) {
    const container = document.getElementById('home-socials-container');
    const div = document.createElement('div');
    div.className = 'dynamic-list-item';
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.alignItems = 'center';

    div.innerHTML = `
        <input type="text" class="social-platform" placeholder="Platform" value="${platform}" required style="width: 120px;">
        <input type="text" class="social-icon" placeholder="Icon (e.g. github)" value="${icon}" required style="width: 120px;">
        <input type="url" class="social-url" placeholder="URL" value="${url}" required style="flex: 1;">
        <label style="display:flex; align-items:center; gap:0.25rem;">
            <input type="checkbox" class="social-enabled" ${enabled !== false ? 'checked' : ''}>
            Enabled
        </label>
        <button type="button" class="btn btn-sm btn-danger btn-remove">X</button>
    `;

    div.querySelector('.btn-remove').addEventListener('click', () => {
        div.remove();
    });

    container.appendChild(div);
}

async function saveHomeData() {
    if (window.setLoading) window.setLoading(true);
    
    try {
        // Collect roles
        const roles = [];
        document.querySelectorAll('#home-roles-container .dynamic-list-item').forEach(el => {
            roles.push({
                icon: el.querySelector('.role-icon').value.trim(),
                label: el.querySelector('.role-label').value.trim()
            });
        });

        // Collect social links
        const social_links = [];
        document.querySelectorAll('#home-socials-container .dynamic-list-item').forEach((el, index) => {
            social_links.push({
                platform: el.querySelector('.social-platform').value.trim(),
                url: el.querySelector('.social-url').value.trim(),
                icon: el.querySelector('.social-icon').value.trim(),
                enabled: el.querySelector('.social-enabled').checked,
                sort_order: index // simple ordering based on DOM order
            });
        });

        const payload = {
            top_text: document.getElementById('home-top-text').value.trim() || null,
            name: document.getElementById('home-name').value.trim() || null,
            tagline: document.getElementById('home-tagline').value.trim() || null,
            intro: document.getElementById('home-intro').value.trim() || null,
            roles: roles,
            social_links: social_links,
            action_projects_label: document.getElementById('home-action-projects').value.trim() || null,
            action_about_label: document.getElementById('home-action-about').value.trim() || null,
            action_contact_label: document.getElementById('home-action-contact').value.trim() || null
        };

        await adminApi.updateHomeConfig(payload);
        if (window.showToast) window.showToast('Home configuration saved successfully.');
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}
