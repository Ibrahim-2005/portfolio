import { adminApi } from './admin-api.js';

let isInitialized = false;
let skillDomains = [];

export async function initSkillsEditor() {
    if (isInitialized) return;
    isInitialized = true;

    const formConfig = document.getElementById('form-skills-config');
    const formSkillEdit = document.getElementById('form-skill-edit');
    const formDomainEdit = document.getElementById('form-domain-edit');
    if (!formConfig || !formSkillEdit || !formDomainEdit) return;

    // Load data on init
    await loadSkillsConfig();
    await loadSkillDomains(); // Load domains before skills
    await loadSkillsList();

    // Setup Config form submit
    formConfig.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSkillsConfig();
    });

    // Setup CRUD buttons for Skills
    document.getElementById('btn-add-skill').addEventListener('click', () => {
        openSkillEditor(null);
    });

    document.getElementById('btn-cancel-skill').addEventListener('click', () => {
        closeSkillEditor();
    });

    formSkillEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSkill();
    });

    // Setup CRUD buttons for Domains
    document.getElementById('btn-add-domain').addEventListener('click', () => {
        openDomainEditor(null);
    });

    document.getElementById('btn-cancel-domain').addEventListener('click', () => {
        closeDomainEditor();
    });

    formDomainEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveDomain();
    });
}

async function loadSkillsConfig() {
    if (window.setLoading) window.setLoading(true);
    try {
        const data = await adminApi.getSkillsConfig();
        if (!data) return;

        document.getElementById('skills-top-text').value = data.top_text || '';
        document.getElementById('skills-heading').value = data.heading || '';
        document.getElementById('skills-tagline').value = data.tagline || '';
    } catch (err) {
        if (window.showToast) window.showToast('Failed to load Skills config: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function saveSkillsConfig() {
    if (window.setLoading) window.setLoading(true);
    try {
        const payload = {
            top_text: document.getElementById('skills-top-text').value.trim() || null,
            heading: document.getElementById('skills-heading').value.trim() || null,
            tagline: document.getElementById('skills-tagline').value.trim() || null
        };
        await adminApi.updateSkillsConfig(payload);
        if (window.showToast) window.showToast('Skills configuration saved successfully.');
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save config: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function loadSkillDomains() {
    const listContainer = document.getElementById('domains-list-container');
    listContainer.innerHTML = '<div style="padding: 1rem; text-align: center;">Loading domains...</div>';
    
    try {
        skillDomains = await adminApi.getSkillDomains() || [];
        
        // Populate dropdown
        const select = document.getElementById('skill-domain');
        select.innerHTML = '<option value="">None</option>';
        skillDomains.forEach(domain => {
            const option = document.createElement('option');
            option.value = domain.id;
            option.textContent = domain.name;
            select.appendChild(option);
        });

        // Populate list
        listContainer.innerHTML = '';
        if (skillDomains.length === 0) {
            listContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: #666;">No domains found.</div>';
            return;
        }

        skillDomains.forEach(domain => {
            const div = document.createElement('div');
            div.className = 'dynamic-list-item';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '0.75rem';
            div.style.borderBottom = '1px solid var(--border-color)';
            
            div.innerHTML = `
                <div>
                    <h4 style="margin: 0 0 0.25rem 0;">${escapeHtml(domain.name)}</h4>
                    <span style="font-size: 0.85rem; color: #666;">Order: ${domain.sort_order}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" class="btn btn-sm btn-secondary btn-edit">Edit</button>
                    <button type="button" class="btn btn-sm btn-danger btn-delete">Delete</button>
                </div>
            `;

            div.querySelector('.btn-edit').addEventListener('click', () => openDomainEditor(domain));
            div.querySelector('.btn-delete').addEventListener('click', () => deleteDomain(domain.id, domain.name));

            listContainer.appendChild(div);
        });
    } catch (err) {
        console.error('Failed to load skill domains:', err);
        listContainer.innerHTML = `<div style="padding: 1rem; color: red;">Failed to load domains.</div>`;
    }
}

async function loadSkillsList() {
    const container = document.getElementById('skills-list-container');
    container.innerHTML = '<div style="padding: 1rem; text-align: center;">Loading skills...</div>';
    
    try {
        const skills = await adminApi.getAdminSkills();
        container.innerHTML = '';
        
        if (!skills || skills.length === 0) {
            container.innerHTML = '<div style="padding: 1rem; text-align: center; color: #666;">No skills found.</div>';
            return;
        }

        skills.forEach(skill => {
            const div = document.createElement('div');
            div.className = 'dynamic-list-item';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '0.75rem';
            div.style.borderBottom = '1px solid var(--border-color)';
            
            const domainName = skill.domain_id ? 
                (skillDomains.find(d => d.id === skill.domain_id)?.name || 'Unknown') : 'None';

            div.innerHTML = `
                <div>
                    <h4 style="margin: 0 0 0.25rem 0;">${escapeHtml(skill.name)}</h4>
                    <span style="font-size: 0.85rem; color: #666;">
                        Domain: ${escapeHtml(domainName)} | Prof: ${skill.proficiency}% | Order: ${skill.sort_order}
                    </span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" class="btn btn-sm btn-secondary btn-edit">Edit</button>
                    <button type="button" class="btn btn-sm btn-danger btn-delete">Delete</button>
                </div>
            `;

            div.querySelector('.btn-edit').addEventListener('click', () => openSkillEditor(skill));
            div.querySelector('.btn-delete').addEventListener('click', () => deleteSkill(skill.id, skill.name));

            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = `<div style="padding: 1rem; color: red;">Failed to load skills: ${escapeHtml(err.message)}</div>`;
    }
}

function openSkillEditor(skill) {
    const formConfig = document.getElementById('form-skills-config');
    const domainsView = document.getElementById('domains-list-view');
    const skillsView = document.getElementById('skills-list-view');
    const formEdit = document.getElementById('form-skill-edit');
    const title = document.getElementById('skill-edit-title');

    formConfig.classList.add('hidden');
    domainsView.classList.add('hidden');
    skillsView.classList.add('hidden');
    formEdit.classList.remove('hidden');

    if (skill) {
        title.textContent = 'Edit Skill';
        document.getElementById('skill-id').value = skill.id;
        document.getElementById('skill-name').value = skill.name || '';
        document.getElementById('skill-proficiency').value = skill.proficiency || 0;
        document.getElementById('skill-icon').value = skill.icon || '';
        document.getElementById('skill-domain').value = skill.domain_id || '';
        document.getElementById('skill-sort-order').value = skill.sort_order || 0;
    } else {
        title.textContent = 'Add Skill';
        document.getElementById('skill-id').value = '';
        document.getElementById('skill-name').value = '';
        document.getElementById('skill-proficiency').value = 0;
        document.getElementById('skill-icon').value = '';
        document.getElementById('skill-domain').value = '';
        document.getElementById('skill-sort-order').value = 0;
    }
}

function closeSkillEditor() {
    document.getElementById('form-skills-config').classList.remove('hidden');
    document.getElementById('domains-list-view').classList.remove('hidden');
    document.getElementById('skills-list-view').classList.remove('hidden');
    document.getElementById('form-skill-edit').classList.add('hidden');
}

async function saveSkill() {
    if (window.setLoading) window.setLoading(true);
    
    try {
        const id = document.getElementById('skill-id').value;
        const domainIdVal = document.getElementById('skill-domain').value;
        
        const payload = {
            name: document.getElementById('skill-name').value.trim(),
            proficiency: parseInt(document.getElementById('skill-proficiency').value, 10) || 0,
            icon: document.getElementById('skill-icon').value.trim() || null,
            domain_id: domainIdVal ? parseInt(domainIdVal, 10) : null,
            sort_order: parseInt(document.getElementById('skill-sort-order').value, 10) || 0
        };

        if (id) {
            await adminApi.updateSkill(id, payload);
            if (window.showToast) window.showToast('Skill updated successfully.');
        } else {
            await adminApi.createSkill(payload);
            if (window.showToast) window.showToast('Skill created successfully.');
        }

        closeSkillEditor();
        await loadSkillsList();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save skill: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function deleteSkill(id, name) {
    if (!confirm(`Are you sure you want to delete skill "${name}"?`)) return;
    
    if (window.setLoading) window.setLoading(true);
    try {
        await adminApi.deleteSkill(id);
        if (window.showToast) window.showToast('Skill deleted successfully.');
        await loadSkillsList();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to delete skill: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

function openDomainEditor(domain) {
    const formConfig = document.getElementById('form-skills-config');
    const domainsView = document.getElementById('domains-list-view');
    const skillsView = document.getElementById('skills-list-view');
    const formEdit = document.getElementById('form-domain-edit');
    const title = document.getElementById('domain-edit-title');

    formConfig.classList.add('hidden');
    domainsView.classList.add('hidden');
    skillsView.classList.add('hidden');
    formEdit.classList.remove('hidden');

    if (domain) {
        title.textContent = 'Edit Domain';
        document.getElementById('domain-id').value = domain.id;
        document.getElementById('domain-name').value = domain.name || '';
        document.getElementById('domain-sort-order').value = domain.sort_order || 0;
    } else {
        title.textContent = 'Add Domain';
        document.getElementById('domain-id').value = '';
        document.getElementById('domain-name').value = '';
        document.getElementById('domain-sort-order').value = 0;
    }
}

function closeDomainEditor() {
    document.getElementById('form-skills-config').classList.remove('hidden');
    document.getElementById('domains-list-view').classList.remove('hidden');
    document.getElementById('skills-list-view').classList.remove('hidden');
    document.getElementById('form-domain-edit').classList.add('hidden');
}

async function saveDomain() {
    if (window.setLoading) window.setLoading(true);
    
    try {
        const id = document.getElementById('domain-id').value;
        const payload = {
            name: document.getElementById('domain-name').value.trim(),
            sort_order: parseInt(document.getElementById('domain-sort-order').value, 10) || 0
        };

        if (id) {
            await adminApi.updateSkillDomain(id, payload);
            if (window.showToast) window.showToast('Domain updated successfully.');
        } else {
            await adminApi.createSkillDomain(payload);
            if (window.showToast) window.showToast('Domain created successfully.');
        }

        closeDomainEditor();
        await loadSkillDomains();
        await loadSkillsList(); // Refresh skills list to update domain names
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save domain: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function deleteDomain(id, name) {
    if (!confirm(`Are you sure you want to delete domain "${name}"?`)) return;
    
    if (window.setLoading) window.setLoading(true);
    try {
        await adminApi.deleteSkillDomain(id);
        if (window.showToast) window.showToast('Domain deleted successfully.');
        await loadSkillDomains();
        await loadSkillsList();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to delete domain: ' + err.message, 'error');
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
