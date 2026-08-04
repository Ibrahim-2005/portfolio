// components/tabs.js - Renders and manages the tab bar
import { state } from '../core/state.js';

export function renderTabs() {
    const tabsContainer = document.querySelector('.tabs');
    tabsContainer.innerHTML = '';

    state.openTabs.forEach(tabData => {
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${state.activeTabId === tabData.id ? 'active' : ''}`;
        
        const icon = document.createElement('span');
        icon.className = 'icon';
        if (tabData.slug === 'projects') {
            icon.textContent = '📦';
        } else if (tabData.slug.includes('contact')) {
            icon.textContent = '✉';
        } else if (tabData.slug === 'home' || tabData.title.toLowerCase() === 'home') {
            icon.textContent = '🏠';
        } else {
            icon.textContent = '📄';
        }
        
        const extension = (!tabData.title.includes('.') && tabData.slug !== 'projects' && !tabData.title.toLowerCase().includes('home')) ? '.md' : '';
        const title = document.createTextNode(` ${tabData.title}${extension}`);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.closeTab(tabData.id);
        });

        tabEl.appendChild(icon);
        tabEl.appendChild(title);
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
