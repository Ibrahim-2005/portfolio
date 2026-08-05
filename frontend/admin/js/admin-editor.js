import { adminApi } from './admin-api.js';

let currentResourceType = 'sections';
let currentItemId = null; // ID of the currently selected resource
let sectionCache = []; // used for parent_id dropdowns

export function initEditor() {
    const resourceTypeSelect = document.getElementById('resource-type-select');
    const btnCreateNew = document.getElementById('btn-create-new');
    const resourceForm = document.getElementById('resource-form');
    const btnDelete = document.getElementById('btn-delete');

    resourceTypeSelect.addEventListener('change', (e) => {
        currentResourceType = e.target.value;
        loadResourceList();
        showEmptyState();
    });

    btnCreateNew.addEventListener('click', () => {
        currentItemId = null;
        buildForm(currentResourceType, null);
    });

    resourceForm.addEventListener('submit', handleFormSubmit);
    btnDelete.addEventListener('click', handleDelete);

    // Initial load
    loadResourceList();
}

async function loadResourceList() {
    const listEl = document.getElementById('resource-list');
    listEl.innerHTML = '<li>Loading...</li>';
    
    try {
        let items = [];
        if (currentResourceType === 'sections') {
            const data = await adminApi.getSections();
            // Flatten the tree for the list view
            items = flattenSections(data);
            sectionCache = items; // save for dropdowns
        } else if (currentResourceType === 'projects') {
            items = await adminApi.getProjects();
        } else if (currentResourceType === 'skills') {
            items = await adminApi.getSkills();
        }

        listEl.innerHTML = '';
        if (items.length === 0) {
            listEl.innerHTML = '<li style="padding:1rem;color:#6c757d;">No items found.</li>';
            return;
        }

        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'resource-item';
            
            // Generate display name
            let name = item.title || item.name;
            if (currentResourceType === 'sections' && item.parent_id) {
                name = `— ${name}`; // Indent children visually
            }

            li.innerHTML = `
                <span class="icon">${item.icon || '📄'}</span>
                <span>${name}</span>
            `;
            
            // The identifier is always 'id' for backend updates
            const iden = item.id;
            
            li.addEventListener('click', () => {
                // Remove active class from all
                document.querySelectorAll('.resource-item').forEach(el => el.classList.remove('selected'));
                li.classList.add('selected');
                currentItemId = iden;
                buildForm(currentResourceType, item);
            });
            
            listEl.appendChild(li);
        });

    } catch (err) {
        listEl.innerHTML = `<li style="padding:1rem;color:red;">Error: ${err.message}</li>`;
    }
}

function flattenSections(sections, parentId = null) {
    let result = [];
    sections.forEach(sec => {
        const flatSec = { ...sec, parent_id: parentId };
        delete flatSec.children;
        result.push(flatSec);
        if (sec.children && sec.children.length > 0) {
            result = result.concat(flattenSections(sec.children, sec.id));
        }
    });
    return result;
}

function showEmptyState() {
    document.getElementById('editor-empty-state').classList.add('active');
    document.getElementById('resource-form').classList.add('hidden');
}

function hideEmptyState() {
    document.getElementById('editor-empty-state').classList.remove('active');
    document.getElementById('resource-form').classList.remove('hidden');
    document.getElementById('form-error').textContent = '';
    document.getElementById('form-success').textContent = '';
}

function buildForm(type, existingData) {
    hideEmptyState();
    
    const isEdit = !!existingData;
    document.getElementById('form-title').textContent = isEdit ? `Edit ${type.slice(0, -1)}` : `New ${type.slice(0, -1)}`;
    document.getElementById('form-resource-type').value = type;
    document.getElementById('form-original-slug').value = existingData ? existingData.id : '';
    
    const btnDelete = document.getElementById('btn-delete');
    if (isEdit) {
        btnDelete.classList.remove('hidden');
    } else {
        btnDelete.classList.add('hidden');
    }

    const dynamicFields = document.getElementById('dynamic-fields');
    dynamicFields.innerHTML = ''; // clear

    if (type === 'sections') {
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="field-title" required value="${existingData?.title || ''}">
            </div>
            <div class="form-group">
                <label>Slug</label>
                <input type="text" id="field-slug" required value="${existingData?.slug || ''}">
            </div>
            <div class="form-group">
                <label>Icon</label>
                <input type="text" id="field-icon" value="${existingData?.icon || ''}" placeholder="e.g. 📄">
            </div>
            <div class="form-group">
                <label>Parent Folder (Optional)</label>
                <select id="field-parent">
                    <option value="">-- None (Root Level) --</option>
                    ${sectionCache.filter(s => s.type === 'folder' && s.id !== existingData?.id).map(s => 
                        `<option value="${s.id}" ${existingData?.parent_id === s.id ? 'selected' : ''}>${s.title}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="field-type">
                    <option value="file" ${existingData?.type === 'file' ? 'selected' : ''}>File (Markdown)</option>
                    <option value="folder" ${existingData?.type === 'folder' ? 'selected' : ''}>Folder</option>
                    <option value="component" ${existingData?.type === 'component' ? 'selected' : ''}>Component (Projects/Skills)</option>
                </select>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" id="field-visible" ${existingData === null || existingData?.is_visible !== false ? 'checked' : ''}>
                <label for="field-visible">Visible in Sidebar</label>
            </div>
            <div class="form-group">
                <label>Content (Markdown)</label>
                <textarea id="field-content" class="code-font">${existingData?.content || ''}</textarea>
            </div>
        `;
    } else if (type === 'projects') {
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="field-name" required value="${existingData?.name || ''}">
            </div>
            <div class="form-group">
                <label>Slug</label>
                <input type="text" id="field-slug" required value="${existingData?.slug || ''}">
            </div>
            <div class="form-group">
                <label>Short Description</label>
                <input type="text" id="field-description" required value="${existingData?.short_description || ''}">
            </div>
            <div class="form-group">
                <label>Tech Stack (comma separated)</label>
                <input type="text" id="field-tech" value="${(existingData?.tech_stack || []).join(', ')}">
            </div>
            <div class="form-group">
                <label>Github URL</label>
                <input type="url" id="field-github" value="${existingData?.github_url || ''}">
            </div>
            <div class="form-group">
                <label>Live URL</label>
                <input type="url" id="field-live" value="${existingData?.live_url || ''}">
            </div>
            <div class="form-group">
                <label>Order</label>
                <input type="number" id="field-order" value="${existingData?.order || 0}">
            </div>
            <div class="form-group">
                <label>Highlights (one per line)</label>
                <textarea id="field-highlights" class="code-font">${(existingData?.highlights || []).join('\\n')}</textarea>
            </div>
        `;
    } else if (type === 'skills') {
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="field-name" required value="${existingData?.name || ''}">
            </div>
            <div class="form-group">
                <label>Category</label>
                <input type="text" id="field-category" required value="${existingData?.category || ''}">
            </div>
            <div class="form-group">
                <label>Icon</label>
                <input type="text" id="field-icon" value="${existingData?.icon || ''}">
            </div>
            <div class="form-group">
                <label>Proficiency (%)</label>
                <input type="number" id="field-prof" min="0" max="100" value="${existingData?.proficiency || 0}">
            </div>
            <div class="form-group">
                <label>Order</label>
                <input type="number" id="field-order" value="${existingData?.order || 0}">
            </div>
        `;
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById('form-error');
    const successEl = document.getElementById('form-success');
    errorEl.textContent = '';
    successEl.textContent = '';

    const type = document.getElementById('form-resource-type').value;
    const isEdit = !!currentItemId;

    let payload = {};

    if (type === 'sections') {
        payload = {
            title: document.getElementById('field-title').value,
            slug: document.getElementById('field-slug').value,
            type: document.getElementById('field-type').value,
            icon: document.getElementById('field-icon').value || null,
            content: document.getElementById('field-content').value || null,
            is_visible: document.getElementById('field-visible').checked,
            parent_id: document.getElementById('field-parent').value ? parseInt(document.getElementById('field-parent').value) : null
        };
    } else if (type === 'projects') {
        payload = {
            name: document.getElementById('field-name').value,
            slug: document.getElementById('field-slug').value,
            short_description: document.getElementById('field-description').value,
            tech_stack: document.getElementById('field-tech').value.split(',').map(s => s.trim()).filter(Boolean),
            github_url: document.getElementById('field-github').value || null,
            live_url: document.getElementById('field-live').value || null,
            order: parseInt(document.getElementById('field-order').value) || 0,
            highlights: document.getElementById('field-highlights').value.split('\\n').map(s => s.trim()).filter(Boolean)
        };
    } else if (type === 'skills') {
        payload = {
            name: document.getElementById('field-name').value,
            category: document.getElementById('field-category').value,
            icon: document.getElementById('field-icon').value || null,
            proficiency: parseInt(document.getElementById('field-prof').value) || 0,
            order: parseInt(document.getElementById('field-order').value) || 0
        };
    }

    try {
        if (isEdit) {
            if (type === 'sections') await adminApi.updateSection(currentItemId, payload);
            else if (type === 'projects') await adminApi.updateProject(currentItemId, payload);
            else if (type === 'skills') await adminApi.updateSkill(currentItemId, payload);
            successEl.textContent = 'Successfully updated!';
        } else {
            if (type === 'sections') await adminApi.createSection(payload);
            else if (type === 'projects') await adminApi.createProject(payload);
            else if (type === 'skills') await adminApi.createSkill(payload);
            successEl.textContent = 'Successfully created!';
        }
        
        // Reload list
        await loadResourceList();
        
        // If it was a create, we might want to stay on the empty state or select the new one. 
        // For simplicity, just return to empty state to force user to pick from list.
        if (!isEdit) {
            setTimeout(() => {
                showEmptyState();
            }, 1500);
        }

    } catch (err) {
        errorEl.textContent = 'Error: ' + err.message;
    }
}

async function handleDelete() {
    if (!currentItemId) return;
    if (!confirm('Are you sure you want to delete this item?')) return;

    const errorEl = document.getElementById('form-error');
    errorEl.textContent = '';

    try {
        if (currentResourceType === 'sections') await adminApi.deleteSection(currentItemId);
        else if (currentResourceType === 'projects') await adminApi.deleteProject(currentItemId);
        else if (currentResourceType === 'skills') await adminApi.deleteSkill(currentItemId);
        
        await loadResourceList();
        showEmptyState();
    } catch (err) {
        errorEl.textContent = 'Error deleting: ' + err.message;
    }
}
