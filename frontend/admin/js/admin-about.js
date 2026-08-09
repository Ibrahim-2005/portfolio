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
            currently_learning: currently_learning
        };

        await adminApi.updateAboutConfig(payload);
        if (window.showToast) window.showToast('About configuration saved successfully.');
    } catch (err) {
        if (window.showToast) window.showToast('Failed to save: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}
