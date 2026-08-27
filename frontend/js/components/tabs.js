// components/tabs.js - Renders and manages the tab bar
import { state } from '../core/state.js';
import { iconService } from '../services/icon-service.js';

export function renderTabs() {
    const tabsContainer = document.querySelector('.tabs');
    tabsContainer.innerHTML = '';

    state.openTabs.forEach(tabData => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${state.activeTabId === tabData.id ? 'active' : ''}`;
        
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

        tabEl.addEventListener('click', () => {
            state.activateTab(tabData.id);
        });

        tabsContainer.appendChild(tabEl);
    });

    // Add mobile dropdown toggle button
    if (state.openTabs.length > 1) {
        const dropdownBtn = document.createElement('div');
        dropdownBtn.className = 'mobile-tab-dropdown-btn';
        dropdownBtn.innerHTML = '▼';
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tabsContainer.classList.toggle('dropdown-open');
        });
        tabsContainer.appendChild(dropdownBtn);
    }
}
