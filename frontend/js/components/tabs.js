// components/tabs.js - Renders and manages the tab bar
import { state } from '../core/state.js';
import { iconService } from '../services/icon-service.js';

let draggedTabId = null;

export function renderTabs() {
    const tabsContainer = document.querySelector('.tabs');
    tabsContainer.innerHTML = '';

    state.openTabs.forEach((tabData, index) => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${state.activeTabId === tabData.id ? 'active' : ''}`;
        tabEl.dataset.tabId = String(tabData.id);
        tabEl.dataset.tabIndex = String(index);
        tabEl.draggable = true;
        
        const icon = iconService.createFileIconElement(tabData, { className: 'tab-icon' });
        
        const rawTitle = tabData.title || tabData.label || tabData.name || tabData.slug || '';
        const rawExt = tabData.extension || '';
        const fullFilename = (rawExt && !rawTitle.toLowerCase().endsWith(rawExt.toLowerCase()))
            ? `${rawTitle}${rawExt}`
            : rawTitle;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'tab-label';
        labelSpan.textContent = fullFilename;
        labelSpan.title = fullFilename;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', `Close ${fullFilename}`);
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.closeTab(tabData.id);
        });

        tabEl.appendChild(icon);
        tabEl.appendChild(labelSpan);
        tabEl.appendChild(closeBtn);

        // Native Drag and Drop Reordering
        tabEl.addEventListener('dragstart', (e) => {
            draggedTabId = tabData.id;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(tabData.id));
            requestAnimationFrame(() => {
                tabEl.classList.add('tab-dragging');
            });
        });

        tabEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (draggedTabId === tabData.id) {
                tabEl.classList.remove('drop-indicator-left', 'drop-indicator-right');
                return;
            }
            const rect = tabEl.getBoundingClientRect();
            const midpoint = rect.left + rect.width / 2;
            if (e.clientX < midpoint) {
                tabEl.classList.add('drop-indicator-left');
                tabEl.classList.remove('drop-indicator-right');
            } else {
                tabEl.classList.add('drop-indicator-right');
                tabEl.classList.remove('drop-indicator-left');
            }
        });

        tabEl.addEventListener('dragleave', () => {
            tabEl.classList.remove('drop-indicator-left', 'drop-indicator-right');
        });

        tabEl.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            tabEl.classList.remove('drop-indicator-left', 'drop-indicator-right');
            if (draggedTabId === null) return;

            const fromIndex = state.openTabs.findIndex(t => t.id === draggedTabId);
            let toIndex = index;
            const rect = tabEl.getBoundingClientRect();
            const isRightHalf = e.clientX >= (rect.left + rect.width / 2);

            if (isRightHalf) {
                toIndex = toIndex >= fromIndex ? toIndex : toIndex + 1;
            } else {
                toIndex = toIndex <= fromIndex ? toIndex : toIndex - 1;
            }

            if (fromIndex !== -1 && fromIndex !== toIndex) {
                state.reorderTabs(fromIndex, toIndex);
            }
            draggedTabId = null;
        });

        tabEl.addEventListener('dragend', () => {
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('tab-dragging', 'drop-indicator-left', 'drop-indicator-right');
            });
            draggedTabId = null;
        });

        tabEl.addEventListener('click', () => {
            state.activateTab(tabData.id);
        });

        tabsContainer.appendChild(tabEl);
    });
}

