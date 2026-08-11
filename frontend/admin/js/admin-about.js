import { adminApi } from './admin-api.js';

let isInitialized = false;

export async function initAboutEditor() {
    if (isInitialized) return;
    isInitialized = true;

    const form = document.getElementById('form-about');
    if (!form) return;

    // Load data on init
    await loadAboutData();

    // Setup dynamic list buttons
    document.getElementById('btn-add-focus').addEventListener('click', () => {
        addFocusField('', '');
    });
    
    document.getElementById('btn-add-learning').addEventListener('click', () => {
        addLearningField('', '');
    });

    // Handle submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveAboutData();
    });

    // Setup Education buttons
    document.getElementById('btn-add-education').addEventListener('click', () => {
        openEducationEditor(null);
    });

    document.getElementById('btn-cancel-education').addEventListener('click', () => {
        closeEducationEditor();
    });

    document.getElementById('form-education-edit').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveEducation();
    });

    // Load education items
    await loadEducationData();
}

async function loadAboutData() {
    if (window.setLoading) window.setLoading(true);
    try {
        const data = await adminApi.getAboutConfig();
        if (!data) return;

        // Populate fields
        document.getElementById('about-top-text').value = data.top_text || '';
        document.getElementById('about-big-text').value = data.big_text || '';
        document.getElementById('about-tagline').value = data.tagline || '';
        document.getElementById('about-about-me').value = data.about_me || '';
        document.getElementById('about-closing-title').value = data.closing_title || '';
        document.getElementById('about-closing-text').value = data.closing_text || '';

        // Populate focus
        const focusContainer = document.getElementById('about-focus-container');
        focusContainer.innerHTML = '';
        (data.current_focus || []).forEach(item => addFocusField(item.emoji, item.text));

        // Populate learning
        const learningContainer = document.getElementById('about-learning-container');
        learningContainer.innerHTML = '';
        (data.currently_learning || []).forEach(item => addLearningField(item.emoji, item.text));

    } catch (err) {
        if (window.showToast) window.showToast('Failed to load About config: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

function addFocusField(emoji, text) {
    const container = document.getElementById('about-focus-container');
    const div = document.createElement('div');
    div.className = 'dynamic-list-item';
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.alignItems = 'center';

    div.innerHTML = `
        <input type="text" class="focus-emoji" placeholder="Emoji" value="${emoji}" required style="width: 80px;">
        <input type="text" class="focus-text" placeholder="Text" value="${text}" required style="flex: 1;">
        <button type="button" class="btn btn-sm btn-danger btn-remove">X</button>
    `;

    div.querySelector('.btn-remove').addEventListener('click', () => {
        div.remove();
    });

    container.appendChild(div);
}

function addLearningField(emoji, text) {
    const container = document.getElementById('about-learning-container');
    const div = document.createElement('div');
    div.className = 'dynamic-list-item';
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    div.style.marginBottom = '0.5rem';
    div.style.alignItems = 'center';

    div.innerHTML = `
        <input type="text" class="learning-emoji" placeholder="Emoji" value="${emoji}" required style="width: 80px;">
        <input type="text" class="learning-text" placeholder="Text" value="${text}" required style="flex: 1;">
        <button type="button" class="btn btn-sm btn-danger btn-remove">X</button>
    `;

    div.querySelector('.btn-remove').addEventListener('click', () => {
        div.remove();
    });

    container.appendChild(div);
}

async function saveAboutData() {
    if (window.setLoading) window.setLoading(true);
    
    try {
        // Collect focus items
        const current_focus = [];
        document.querySelectorAll('#about-focus-container .dynamic-list-item').forEach(el => {
            current_focus.push({
                emoji: el.querySelector('.focus-emoji').value.trim(),
                text: el.querySelector('.focus-text').value.trim()
            });
        });

        // Collect learning items
        const currently_learning = [];
        document.querySelectorAll('#about-learning-container .dynamic-list-item').forEach(el => {
            currently_learning.push({
                emoji: el.querySelector('.learning-emoji').value.trim(),
                text: el.querySelector('.learning-text').value.trim()
            });
        });

        const payload = {
            top_text: document.getElementById('about-top-text').value.trim() || null,
            big_text: document.getElementById('about-big-text').value.trim() || null,
            tagline: document.getElementById('about-tagline').value.trim() || null,
            about_me: document.getElementById('about-about-me').value.trim() || null,
            current_focus: current_focus,
            currently_learning: currently_learning,
            closing_title: document.getElementById('about-closing-title').value.trim() || null,
            closing_text: document.getElementById('about-closing-text').value.trim() || null
        };

        await adminApi.updateAboutConfig(payload);
        if (window.showToast) window.showToast('About configuration saved successfully.');
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

// ==========================================
// Education CRUD
// ==========================================

let currentEducationList = [];

async function loadEducationData() {
    try {
        const data = await adminApi.getEducationAdmin();
        currentEducationList = data || [];
        renderEducationList();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to load Education data: ' + err.message, 'error');
    }
}

function renderEducationList() {
    const container = document.getElementById('education-list-container');
    container.innerHTML = '';

    currentEducationList.forEach(ed => {
        const div = document.createElement('div');
        div.className = 'dynamic-list-item';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '0.5rem';
        div.style.border = '1px solid var(--border-color)';
        div.style.marginBottom = '0.5rem';
        div.style.borderRadius = '4px';

        div.innerHTML = `
            <div>
                <strong>${ed.institution}</strong> - ${ed.qualification}
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button type="button" class="btn btn-sm btn-secondary btn-edit">Edit</button>
                <button type="button" class="btn btn-sm btn-danger btn-delete">Delete</button>
            </div>
        `;

        div.querySelector('.btn-edit').addEventListener('click', () => openEducationEditor(ed));
        div.querySelector('.btn-delete').addEventListener('click', () => deleteEducation(ed.id));

        container.appendChild(div);
    });
}

function openEducationEditor(ed = null) {
    document.getElementById('form-about').classList.add('hidden');
    document.getElementById('education-list-view').classList.add('hidden');

    const form = document.getElementById('form-education-edit');
    form.classList.remove('hidden');

    if (ed) {
        document.getElementById('education-edit-title').textContent = 'Edit Education';
        document.getElementById('education-id').value = ed.id;
        document.getElementById('education-institution').value = ed.institution || '';
        document.getElementById('education-qualification').value = ed.qualification || '';
        document.getElementById('education-start').value = ed.start_year || '';
        document.getElementById('education-end').value = ed.end_year || '';
        document.getElementById('education-grade').value = ed.grade || '';
        document.getElementById('education-description').value = ed.description || '';
        document.getElementById('education-sort').value = ed.sort_order || 0;
    } else {
        document.getElementById('education-edit-title').textContent = 'Add Education';
        document.getElementById('education-id').value = '';
        document.getElementById('education-institution').value = '';
        document.getElementById('education-qualification').value = '';
        document.getElementById('education-start').value = '';
        document.getElementById('education-end').value = '';
        document.getElementById('education-grade').value = '';
        document.getElementById('education-description').value = '';
        document.getElementById('education-sort').value = 0;
    }
}

function closeEducationEditor() {
    document.getElementById('form-education-edit').classList.add('hidden');
    document.getElementById('form-about').classList.remove('hidden');
    document.getElementById('education-list-view').classList.remove('hidden');
}

async function saveEducation() {
    if (window.setLoading) window.setLoading(true);

    try {
        const id = document.getElementById('education-id').value;
        const payload = {
            institution: document.getElementById('education-institution').value.trim(),
            qualification: document.getElementById('education-qualification').value.trim(),
            start_year: parseInt(document.getElementById('education-start').value),
            end_year: document.getElementById('education-end').value ? parseInt(document.getElementById('education-end').value) : null,
            grade: document.getElementById('education-grade').value.trim() || null,
            description: document.getElementById('education-description').value.trim() || null,
            sort_order: parseInt(document.getElementById('education-sort').value) || 0
        };

        if (id) {
            await adminApi.updateEducation(id, payload);
            if (window.showToast) window.showToast('Education updated.');
        } else {
            await adminApi.createEducation(payload);
            if (window.showToast) window.showToast('Education added.');
        }

        closeEducationEditor();
        await loadEducationData();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save Education: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}

async function deleteEducation(id) {
    if (!confirm('Are you sure you want to delete this education entry?')) return;

    if (window.setLoading) window.setLoading(true);
    try {
        await adminApi.deleteEducation(id);
        if (window.showToast) window.showToast('Education deleted.');
        await loadEducationData();
    } catch (err) {
        if (window.showToast) window.showToast('Failed to delete Education: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}
