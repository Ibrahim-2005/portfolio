import { adminApi } from './admin-api.js';
import { showToast } from './admin-dashboard.js';

let sidebarItems = [];
let currentEditingId = null;

export async function initSidebarEditor() {
    await loadSidebarItems();
    bindSidebarEvents();
}

async function loadSidebarItems() {
    try {
        sidebarItems = await adminApi.getSidebarItems();
        renderSidebarItems();
    } catch (error) {
        console.error('Error loading sidebar items:', error);
        showToast('Failed to load sidebar items', 'error');
    }
}

function renderSidebarItems() {
    const container = document.getElementById('sidebar-items-container');
    container.innerHTML = '';

    if (sidebarItems.length === 0) {
        container.innerHTML = '<div class="empty-state">No sidebar items found.</div>';
        return;
    }

    sidebarItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'list-item-row';
        row.innerHTML = `
            <div>
                <strong>${item.label}</strong> 
                <small style="color: var(--fg-muted); margin-left: 8px;">slug: ${item.slug} | order: ${item.sort_order}</small>
                <div style="font-size: 0.8rem; margin-top: 4px; color: ${item.is_visible ? 'var(--accent-color)' : 'var(--fg-muted)'};">
                    ${item.is_visible ? 'Visible' : 'Hidden'} | ${item.has_icon ? 'Custom Icon' : 'Default Icon'}
                </div>
            </div>
            <div>
                <button class="btn btn-sm btn-secondary btn-edit-sidebar" data-id="${item.id}">Edit</button>
            </div>
        `;
        container.appendChild(row);
    });

    document.querySelectorAll('.btn-edit-sidebar').forEach(btn => {
        btn.addEventListener('click', () => openSidebarEdit(btn.dataset.id));
    });
}

function openSidebarEdit(id) {
    const item = sidebarItems.find(i => i.id == id);
    if (!item) return;

    currentEditingId = item.id;
    document.getElementById('sidebar-id').value = item.id;
    document.getElementById('sidebar-slug').value = item.slug;
    document.getElementById('sidebar-label').value = item.label;
    document.getElementById('sidebar-extension').value = item.extension || '';
    document.getElementById('sidebar-sort-order').value = item.sort_order;
    document.getElementById('sidebar-is-visible').checked = item.is_visible;

    document.getElementById('form-sidebar-edit').classList.remove('hidden');
    document.getElementById('form-sidebar-icon').classList.remove('hidden');

    const iconPreview = document.getElementById('sidebar-icon-preview');
    const iconImg = document.getElementById('sidebar-icon-img');
    
    if (item.has_icon) {
        // Cache bust the image
        iconImg.src = `/api/sidebar/${item.id}/icon?t=${Date.now()}`;
        iconPreview.style.display = 'block';
    } else {
        iconImg.src = '';
        iconPreview.style.display = 'none';
    }
}

function closeSidebarEdit() {
    currentEditingId = null;
    document.getElementById('form-sidebar-edit').classList.add('hidden');
    document.getElementById('form-sidebar-icon').classList.add('hidden');
    document.getElementById('form-sidebar-edit').reset();
    document.getElementById('form-sidebar-icon').reset();
}

function bindSidebarEvents() {
    document.getElementById('btn-cancel-sidebar').addEventListener('click', closeSidebarEdit);

    document.getElementById('form-sidebar-edit').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentEditingId) return;

        const data = {
            label: document.getElementById('sidebar-label').value,
            extension: document.getElementById('sidebar-extension').value || null,
            sort_order: parseInt(document.getElementById('sidebar-sort-order').value, 10),
            is_visible: document.getElementById('sidebar-is-visible').checked
        };

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            await adminApi.updateSidebarItem(currentEditingId, data);
            showToast('Sidebar item updated successfully', 'success');
            await loadSidebarItems();
            closeSidebarEdit();
        } catch (error) {
            console.error(error);
            showToast('Failed to update sidebar item', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Changes';
        }
    });

    document.getElementById('form-sidebar-icon').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentEditingId) return;

        const fileInput = document.getElementById('sidebar-icon-upload');
        if (!fileInput.files.length) return;
        const file = fileInput.files[0];

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';

        try {
            await adminApi.uploadSidebarIcon(currentEditingId, file);
            showToast('Icon uploaded successfully', 'success');
            await loadSidebarItems();
            openSidebarEdit(currentEditingId); // refresh preview
            fileInput.value = '';
        } catch (error) {
            console.error(error);
            showToast('Failed to upload icon', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Upload Icon';
        }
    });

    document.getElementById('btn-remove-sidebar-icon').addEventListener('click', async () => {
        if (!currentEditingId) return;
        if (!confirm('Are you sure you want to remove this custom icon?')) return;

        try {
            await adminApi.deleteSidebarIcon(currentEditingId);
            showToast('Icon removed successfully', 'success');
            await loadSidebarItems();
            openSidebarEdit(currentEditingId); // refresh preview
        } catch (error) {
            console.error(error);
            showToast('Failed to remove icon', 'error');
        }
    });
}
