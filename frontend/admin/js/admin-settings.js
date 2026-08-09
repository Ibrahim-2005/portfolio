import { adminApi } from './admin-api.js';

let isInitialized = false;

export async function initSettingsEditor() {
    if (isInitialized) return;
    isInitialized = true;

    const formConfig = document.getElementById('form-settings-config');
    if (!formConfig) return;

    await loadSettingsConfig();

    formConfig.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSettingsConfig();
    });
}

async function loadSettingsConfig() {
    try {
        const config = await adminApi.getPublicSettings() || {};
        document.getElementById('settings-author-text').value = config.author_text || '';
        document.getElementById('settings-tech-stack-text').value = config.tech_stack_text || '';
    } catch (err) {
        console.error('Failed to load settings config:', err);
    }
}

async function saveSettingsConfig() {
    if (window.setLoading) window.setLoading(true);
    
    try {
        const payload = {
            author_text: document.getElementById('settings-author-text').value.trim() || null,
            tech_stack_text: document.getElementById('settings-tech-stack-text').value.trim() || null
        };
        
        await adminApi.updatePublicSettings(payload);
        if (window.showToast) window.showToast('Public settings updated successfully.');
    } catch (err) {
        if (window.showToast) window.showToast('Failed to update settings: ' + err.message, 'error');
    } finally {
        if (window.setLoading) window.setLoading(false);
    }
}
