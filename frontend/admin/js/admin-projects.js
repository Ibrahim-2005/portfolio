import { adminApi } from './admin-api.js';

let isInitialized = false;

export async function initProjectsEditor() {
    if (isInitialized) return;
    isInitialized = true;

    const formConfig = document.getElementById('form-projects-config');
    const formEdit = document.getElementById('form-project-edit');
    if (!formConfig || !formEdit) return;

    // Load data on init
    await loadProjectsConfig();
    await loadProjectsList();

    // Setup Config form submit
    formConfig.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProjectsConfig();
    });

    // Setup CRUD buttons
    document.getElementById('btn-add-project').addEventListener('click', () => {
        openProjectEditor(null);
    });

    document.getElementById('btn-cancel-project').addEventListener('click', () => {
        closeProjectEditor();
    });

    document.getElementById('btn-add-tech').addEventListener('click', () => {
        addTechField('', '');
    });

    document.getElementById('btn-add-highlight').addEventListener('click', () => {
        addHighlightField('');
    });

    formEdit.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProject();
    });
}

async function loadProjectsConfig() {
    if (window.setLoading) window.setLoading(true);
    try {
        const data = await adminApi.getProjectsConfig();
        if (!data) return;

        document.getElementById('projects-top-text').value = data.top_text || '';
        document.getElementById('projects-heading').value = data.heading || '';
        document.getElementById('projects-tagline').value = data.tagline || '';
    } catch (err) {
        if (window.showToast) window.showToast('Failed to load Projects config: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function saveProjectsConfig() {
    if (window.setLoading) window.setLoading(true);
    try {
        const payload = {
            top_text: document.getElementById('projects-top-text').value.trim() || null,
            heading: document.getElementById('projects-heading').value.trim() || null,
            tagline: document.getElementById('projects-tagline').value.trim() || null
        };
        await adminApi.updateProjectsConfig(payload);
        if (window.showToast) window.showToast('Projects configuration saved successfully.');
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save config: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function loadProjectsList() {
    const container = document.getElementById('projects-list-container');
    container.innerHTML = '<div style="padding: 1rem; text-align: center;">Loading projects...</div>';
    
    try {
        const projects = await adminApi.getProjects();
        container.innerHTML = '';
        
        if (!projects || projects.length === 0) {
            container.innerHTML = '<div style="padding: 1rem; text-align: center; color: #666;">No projects found.</div>';
            return;
        }

        projects.forEach(project => {
            const div = document.createElement('div');
            div.className = 'dynamic-list-item';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '0.75rem';
            div.style.borderBottom = '1px solid var(--border-color)';
            
            div.innerHTML = `
                <div>
                    <h4 style="margin: 0 0 0.25rem 0;">${escapeHtml(project.title)} ${project.featured ? '⭐' : ''}</h4>
                    <span style="font-size: 0.85rem; color: #666;">Order: ${project.sort_order}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button type="button" class="btn btn-sm btn-secondary btn-edit">Edit</button>
                    <button type="button" class="btn btn-sm btn-danger btn-delete">Delete</button>
                </div>
            `;

            div.querySelector('.btn-edit').addEventListener('click', () => openProjectEditor(project));
            div.querySelector('.btn-delete').addEventListener('click', () => deleteProject(project.id, project.title));

            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = `<div style="padding: 1rem; color: red;">Failed to load projects: ${escapeHtml(err.message)}</div>`;
    }
}

function openProjectEditor(project) {
    const formConfig = document.getElementById('form-projects-config');
    const listView = document.getElementById('projects-list-view');
    const formEdit = document.getElementById('form-project-edit');
    const title = document.getElementById('project-edit-title');

    formConfig.classList.add('hidden');
    listView.classList.add('hidden');
    formEdit.classList.remove('hidden');

    document.getElementById('project-tech-container').innerHTML = '';
    document.getElementById('project-highlights-container').innerHTML = '';

    if (project) {
        title.textContent = 'Edit Project';
        document.getElementById('project-id').value = project.id;
        document.getElementById('project-title').value = project.title || '';
        document.getElementById('project-subtitle').value = project.subtitle || '';
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-repo-url').value = project.repo_url || '';
        document.getElementById('project-live-url').value = project.live_url || '';
        document.getElementById('project-sort-order').value = project.sort_order || 0;
        document.getElementById('project-featured').checked = project.featured || false;

        (project.tech_stack || []).forEach(tech => addTechField(tech.name, tech.icon));
        (project.highlights || []).forEach(hl => addHighlightField(hl));
    } else {
        title.textContent = 'Add Project';
        document.getElementById('project-id').value = '';
        document.getElementById('project-title').value = '';
        document.getElementById('project-subtitle').value = '';
        document.getElementById('project-description').value = '';
        document.getElementById('project-repo-url').value = '';
        document.getElementById('project-live-url').value = '';
        document.getElementById('project-sort-order').value = 0;
        document.getElementById('project-featured').checked = false;
    }
}

function closeProjectEditor() {
    document.getElementById('form-projects-config').classList.remove('hidden');
    document.getElementById('projects-list-view').classList.remove('hidden');
    document.getElementById('form-project-edit').classList.add('hidden');
}

function addTechField(name, icon) {
    const container = document.getElementById('project-tech-container');
    const div = document.createElement('div');
    div.className = 'dynamic-list-item';
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.alignItems = 'center';

    div.innerHTML = `
        <input type="text" class="tech-name" placeholder="Name (e.g. React)" value="${escapeHtml(name)}" required style="flex: 1;">
        <input type="text" class="tech-icon" placeholder="Icon string" value="${escapeHtml(icon || '')}" style="width: 120px;">
        <button type="button" class="btn btn-sm btn-danger btn-remove">X</button>
    `;

    div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
    container.appendChild(div);
}

function addHighlightField(highlight) {
    const container = document.getElementById('project-highlights-container');
    const div = document.createElement('div');
    div.className = 'dynamic-list-item';
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.alignItems = 'center';

    div.innerHTML = `
        <input type="text" class="highlight-text" placeholder="Highlight detail..." value="${escapeHtml(highlight)}" required style="flex: 1;">
        <button type="button" class="btn btn-sm btn-danger btn-remove">X</button>
    `;

    div.querySelector('.btn-remove').addEventListener('click', () => div.remove());
    container.appendChild(div);
}

async function saveProject() {
    if (window.setLoading) window.setLoading(true);
    
    try {
        const id = document.getElementById('project-id').value;
        
        // Collect tech stack
        const tech_stack = [];
        document.querySelectorAll('#project-tech-container .dynamic-list-item').forEach(el => {
            tech_stack.push({
                name: el.querySelector('.tech-name').value.trim(),
                icon: el.querySelector('.tech-icon').value.trim() || null
            });
        });

        // Collect highlights
        const highlights = [];
        document.querySelectorAll('#project-highlights-container .dynamic-list-item').forEach(el => {
            highlights.push(el.querySelector('.highlight-text').value.trim());
        });

        const payload = {
            title: document.getElementById('project-title').value.trim(),
            subtitle: document.getElementById('project-subtitle').value.trim() || null,
            description: document.getElementById('project-description').value.trim(),
            repo_url: document.getElementById('project-repo-url').value.trim() || null,
            live_url: document.getElementById('project-live-url').value.trim() || null,
            sort_order: parseInt(document.getElementById('project-sort-order').value, 10) || 0,
            featured: document.getElementById('project-featured').checked,
            tech_stack: tech_stack,
            highlights: highlights
        };

        if (id) {
            await adminApi.updateProject(id, payload);
            if (window.showToast) window.showToast('Project updated successfully.');
        } else {
            await adminApi.createProject(payload);
            if (window.showToast) window.showToast('Project created successfully.');
        }

        closeProjectEditor();
        await loadProjectsList();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save project: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function deleteProject(id, title) {
    if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;
    
    if (window.setLoading) window.setLoading(true);
    try {
        await adminApi.deleteProject(id);
        if (window.showToast) window.showToast('Project deleted successfully.');
        await loadProjectsList();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to delete project: ' + err.message, 'error');
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
