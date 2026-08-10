import api from './admin-api.js';
import { showToast } from './admin-editor.js';

let initialized = false;

export async function initReadmeEditor() {
    if (initialized) return;

    const form = document.getElementById('form-readme-config');
    if (!form) return;

    try {
        const config = await api.getReadmeConfig();
        if (config) {
            document.getElementById('readme-content').value = config.content || '';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            try {
                const data = {
                    content: document.getElementById('readme-content').value || null
                };

                await api.updateReadmeConfig(data);
                showToast('README configuration saved successfully');
            } catch (error) {
                console.error('Error saving README config:', error);
                showToast('Failed to save README configuration', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        initialized = true;
    } catch (error) {
        console.error('Error initializing README editor:', error);
        showToast('Failed to load README configuration', 'error');
    }
}
