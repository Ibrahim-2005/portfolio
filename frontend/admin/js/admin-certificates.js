import api from './admin-api.js';
import { showToast } from './admin-editor.js';

let initialized = false;

export async function initCertificatesEditor() {
    if (initialized) return;

    const form = document.getElementById('form-certificates-config');
    if (!form) return;

    try {
        const config = await api.getCertificatesConfig();
        if (config) {
            document.getElementById('certificates-content').value = config.content || '';
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            try {
                const data = {
                    content: document.getElementById('certificates-content').value || null
                };

                await api.updateCertificatesConfig(data);
                showToast('Certificates configuration saved successfully');
            } catch (error) {
                console.error('Error saving certificates config:', error);
                showToast('Failed to save Certificates configuration', 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        initialized = true;
    } catch (error) {
        console.error('Error initializing certificates editor:', error);
        showToast('Failed to load Certificates configuration', 'error');
    }
}
