import { adminApi } from './admin-api.js';
import { showToast, setLoading } from "./admin-dashboard.js";

let isInitialized = false;

export async function initMessagesEditor() {
    if (isInitialized) return;
    isInitialized = true;

    await loadMessages();
}

async function loadMessages() {
    const container = document.getElementById('messages-list-container');
    
    try {
        setLoading(true);
        const messages = await adminApi.getMessages();
        
        container.innerHTML = '';
        
        if (!messages || messages.length === 0) {
            container.innerHTML = '<div class="empty-state">No messages found.</div>';
            return;
        }

        messages.forEach(msg => {
            const el = document.createElement('div');
            el.className = 'list-item';
            if (!msg.is_read) {
                el.style.borderLeft = '4px solid var(--primary-color)';
                el.style.backgroundColor = 'var(--bg-lighter)';
            }
            
            el.innerHTML = `
                <div class="item-content" style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0;">${escapeHtml(msg.name)} <span style="font-weight: normal; color: var(--text-muted);">&lt;${escapeHtml(msg.email)}&gt;</span></h4>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">${new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    ${msg.phone ? `<div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.25rem;">Phone: ${escapeHtml(msg.phone)}</div>` : ''}
                    ${msg.subject ? `<div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem;">Subject: ${escapeHtml(msg.subject)}</div>` : ''}
                    <div style="white-space: pre-wrap; font-size: 0.95rem;">${escapeHtml(msg.message)}</div>
                </div>
                <div class="item-actions" style="margin-left: 1rem; align-self: flex-start;">
                    ${!msg.is_read ? `<button class="btn btn-sm btn-primary btn-mark-read" data-id="${msg.id}">Mark Read</button>` : '<span style="color: var(--text-muted); font-size: 0.85rem;">Read</span>'}
                </div>
            `;
            
            if (!msg.is_read) {
                const btn = el.querySelector('.btn-mark-read');
                btn.addEventListener('click', async () => {
                    try {
                        btn.disabled = true;
                        await adminApi.markMessageRead(msg.id);
                        showToast('Message marked as read', 'success');
                        
                        // Update UI statelessly
                        msg.is_read = true;
                        el.style.borderLeft = 'none';
                        el.style.backgroundColor = 'transparent';
                        const actionsDiv = el.querySelector('.item-actions');
                        actionsDiv.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">Read</span>';
                    } catch (error) {
                        btn.disabled = false;
                        showToast(error.message || 'Failed to mark message as read', 'error');
                    }
                });
            }
            
            container.appendChild(el);
        });
    } catch (error) {
        showToast(error.message || 'Failed to load messages', 'error');
        container.innerHTML = '<div class="empty-state error-message">Failed to load messages.</div>';
    } finally {
        setLoading(false);
    }
}

function escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
