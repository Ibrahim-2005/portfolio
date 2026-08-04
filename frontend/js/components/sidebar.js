// components/sidebar.js - Renders and manages the file tree
import { api } from '../core/api.js';
import { state } from '../core/state.js';

export let flatFileNodes = []; // Store a flat map for easy lookup

export function getFiles() {
    return flatFileNodes.filter(n => n.type !== 'folder');
}

export async function initSidebar() {
    const sidebarContent = document.querySelector('.sidebar-content');
    sidebarContent.innerHTML = '<div style="padding: 10px; color: var(--fg-muted);">Loading...</div>';

    const sections = await api.getSections();
    if (!sections) {
        sidebarContent.innerHTML = '<div style="padding: 10px; color: #ff5f56;">Failed to load explorer. Make sure backend is running.</div>';
        return;
    }

    flatFileNodes = [];
    sidebarContent.innerHTML = '';
    renderTree(sections, sidebarContent, 0);

    // After rendering, if Home exists, open it by default
    const homeNode = flatFileNodes.find(n => n.slug === 'home' || n.title.toLowerCase() === 'home');
    if (homeNode) {
        state.openTab(homeNode);
    }

    // Bind sidebar toggle button
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        // Close sidebar if clicking outside of it when open
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

function renderTree(nodes, container, depth) {
    nodes.sort((a, b) => a.sort_order - b.sort_order).forEach(node => {
        flatFileNodes.push(node);
        
        const item = document.createElement('div');
        item.className = `tree-item ${node.type}`;
        item.dataset.id = node.id;
        
        // Indentation
        const indent = document.createElement('span');
        indent.className = 'indent';
        indent.style.width = `${depth * 12}px`;
        item.appendChild(indent);

        // Chevron for folders
        if (node.type === 'folder') {
            const chevron = document.createElement('span');
            chevron.className = 'chevron';
            chevron.textContent = '▼'; // Default expanded
            item.appendChild(chevron);
            item.classList.add('expanded');
        } else {
            // Spacer for files aligning with folders
            const spacer = document.createElement('span');
            spacer.className = 'chevron';
            item.appendChild(spacer);
        }

        // Icon
        const icon = document.createElement('span');
        icon.className = 'icon';
        if (node.type === 'folder') {
            icon.textContent = '📁';
        } else if (node.slug === 'projects') {
            icon.textContent = '📦';
        } else if (node.slug.includes('contact')) {
            icon.textContent = '✉';
        } else if (node.slug === 'home' || node.title.toLowerCase() === 'home') {
            icon.textContent = '🏠';
        } else {
            icon.textContent = '📄';
        }
        item.appendChild(icon);

        // Title
        const extension = (node.type === 'page' && !node.title.includes('.') && node.slug !== 'projects' && !node.title.toLowerCase().includes('home')) ? '.md' : '';
        const title = document.createTextNode(` ${node.title}${extension}`);
        item.appendChild(title);

        // Click handler
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (node.type === 'folder') {
                item.classList.toggle('expanded');
                const childrenContainer = item.nextElementSibling;
                if (childrenContainer && childrenContainer.classList.contains('tree-children')) {
                    childrenContainer.style.display = item.classList.contains('expanded') ? 'block' : 'none';
                    item.querySelector('.chevron').textContent = item.classList.contains('expanded') ? '▼' : '▶';
                }
            } else {
                state.openTab(node);
                // Close sidebar on mobile/tablet after selection
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && window.innerWidth <= 1024) {
                    sidebar.classList.remove('open');
                }
            }
        });

        container.appendChild(item);

        // Render children recursively
        if (node.type === 'folder' && node.children && node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            container.appendChild(childrenContainer);
            renderTree(node.children, childrenContainer, depth + 1);
        }
    });
}

export function updateSidebarActive() {
    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
    const activeTab = state.getActiveTab();
    if (activeTab) {
        const el = document.querySelector(`.tree-item[data-id="${activeTab.id}"]`);
        if (el) el.classList.add('active');
    }
}

export function openTabBySlug(slug) {
    const node = flatFileNodes.find(n => n.slug === slug || n.title.toLowerCase() === slug);
    if (node && node.type !== 'folder') {
        state.openTab(node);
        return true;
    }
    return false;
}
