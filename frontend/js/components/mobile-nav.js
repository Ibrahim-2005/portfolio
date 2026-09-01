// components/mobile-nav.js - Mobile & Tablet Top Navigation Bar and Page Search Palette (<= 1024px)
import { state } from '../core/state.js';
import { iconService } from '../services/icon-service.js';
import { flatFileNodes, getFiles } from './sidebar.js';
import { toggleSettings } from './activity-bar.js';


let isPaletteOpen = false;
let selectedPaletteIndex = 0;
let currentFilteredFiles = [];

/**
 * Standard filename mapping for PortfolioOS pages and sections.
 * Maps any tab, file node, or slug to its clean display filename.
 */
export function getDisplayFilename(tabOrNode) {
    if (!tabOrNode) return 'home.py';

    const title = tabOrNode.title || tabOrNode.label || tabOrNode.name || tabOrNode.slug || '';
    const ext = tabOrNode.extension || '';
    const slug = (tabOrNode.slug || '').toLowerCase();

    // Virtual / special cases
    if (slug === 'shortcuts' || title.toLowerCase().includes('shortcut')) {
        return 'shortcuts.json';
    }

    // Normal file nodes with explicit extension
    if (ext && !title.toLowerCase().endsWith(ext.toLowerCase())) {
        return `${title}${ext}`;
    }
    if (title.includes('.')) {
        return title;
    }

    // Known slug fallback mapping
    const fallbackMap = {
        'home': 'home.py',
        'about': 'about.html',
        'projects': 'projects.sql',
        'skills': 'skills.json',
        'contact': 'contact.jwt',
        'readme': 'README.md',
        'resume': 'Mohamed_Ibrahm_Resume.pdf',
        'education': 'education.edu',
        'certificates': 'certificates/'
    };

    if (fallbackMap[slug]) {
        return fallbackMap[slug];
    }

    return title || 'home.py';
}

/**
 * Updates the top mobile navigation bar with the currently active page filename and icon.
 */
export function updateMobileNavHeader() {
    const filenameEl = document.getElementById('mobile-nav-filename');
    const iconEl = document.getElementById('mobile-nav-icon');
    if (!filenameEl) return;

    const activeTab = state.getActiveTab();
    const filename = getDisplayFilename(activeTab);
    filenameEl.textContent = filename;
    filenameEl.title = filename;

    if (iconEl && activeTab) {
        iconEl.innerHTML = '';
        const icon = iconService.createFileIconElement(activeTab, { className: 'mobile-nav-file-icon' });
        iconEl.appendChild(icon);
    }
}

/**
 * Opens the mobile/tablet sidebar drawer.
 */
export function openMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const hamburgerBtn = document.getElementById('mobile-hamburger-btn');

    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
}

/**
 * Closes the mobile/tablet sidebar drawer.
 */
export function closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const hamburgerBtn = document.getElementById('mobile-hamburger-btn');

    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
}

/**
 * Toggles the mobile/tablet sidebar drawer.
 */
export function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    if (sidebar.classList.contains('open')) {
        closeMobileSidebar();
    } else {
        openMobileSidebar();
    }
}

/**
 * Returns the complete list of navigable PortfolioOS page nodes.
 */
export function getNavigablePages() {
    let files = getFiles();
    if (!files || files.length === 0) {
        files = flatFileNodes.filter(n => n.type !== 'folder');
    }

    if (!files || files.length === 0) {
        // Fallback default list if sidebar hasn't loaded yet
        return [
            { id: 1, slug: 'home', title: 'home', extension: '.py', desc: 'Welcome & Introduction' },
            { id: 2, slug: 'about', title: 'about', extension: '.html', desc: 'About Me & Background' },
            { id: 3, slug: 'projects', title: 'projects', extension: '.sql', desc: 'Featured Projects' },
            { id: 4, slug: 'skills', title: 'skills', extension: '.json', desc: 'Technical Skills' },
            { id: 5, slug: 'contact', title: 'contact', extension: '.jwt', desc: 'Get in Touch' },
            { id: 6, slug: 'readme', title: 'README', extension: '.md', desc: 'PortfolioOS Docs' },
            { id: 7, slug: 'resume', title: 'Mohamed_Ibrahm_Resume', extension: '.pdf', desc: 'Resume' }
        ];
    }

    return files;
}

/**
 * Opens the non-desktop page search palette.
 */
export function openMobilePagePalette() {
    const overlay = document.getElementById('mobile-page-palette-overlay');
    const input = document.getElementById('mobile-palette-input');
    if (!overlay) return;

    isPaletteOpen = true;
    overlay.style.display = 'flex';
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 50);
    }

    selectedPaletteIndex = 0;
    renderMobilePaletteResults('');
}

/**
 * Closes the non-desktop page search palette.
 */
export function closeMobilePagePalette() {
    const overlay = document.getElementById('mobile-page-palette-overlay');
    if (!overlay) return;

    isPaletteOpen = false;
    overlay.style.display = 'none';
}

/**
 * Filters and renders the page items inside the search palette.
 */
function renderMobilePaletteResults(query = '') {
    const listEl = document.getElementById('mobile-palette-list');
    if (!listEl) return;

    listEl.innerHTML = '';
    const cleanQuery = (query || '').trim().toLowerCase();
    const allPages = getNavigablePages();

    currentFilteredFiles = allPages.filter(node => {
        if (!cleanQuery) return true;
        const filename = getDisplayFilename(node).toLowerCase();
        const slug = (node.slug || '').toLowerCase();
        const title = (node.title || node.label || '').toLowerCase();
        return filename.includes(cleanQuery) || slug.includes(cleanQuery) || title.includes(cleanQuery);
    });

    if (currentFilteredFiles.length === 0) {
        listEl.innerHTML = '<div class="mobile-palette-empty">No matching pages or files found</div>';
        return;
    }

    if (selectedPaletteIndex >= currentFilteredFiles.length) {
        selectedPaletteIndex = 0;
    }

    currentFilteredFiles.forEach((node, idx) => {
        const item = document.createElement('div');
        item.className = `mobile-palette-item ${idx === selectedPaletteIndex ? 'selected' : ''}`;
        item.setAttribute('role', 'option');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-selected', idx === selectedPaletteIndex ? 'true' : 'false');

        const iconContainer = document.createElement('span');
        iconContainer.className = 'mobile-palette-item-icon';
        const icon = iconService.createFileIconElement(node);
        iconContainer.appendChild(icon);

        const filenameEl = document.createElement('span');
        filenameEl.className = 'mobile-palette-item-filename';
        filenameEl.textContent = getDisplayFilename(node);

        item.appendChild(iconContainer);
        item.appendChild(filenameEl);

        // Click handler to select and navigate
        item.addEventListener('click', () => {
            state.openTab(node);
            closeMobilePagePalette();
            closeMobileSidebar();
        });

        listEl.appendChild(item);
    });

}

/**
 * Initializes mobile and tablet navigation listeners and reactive UI synchronization.
 */
export function initMobileNav() {
    // 1. Subscribe to state changes to automatically update the top bar filename & icon
    state.subscribe(() => {
        updateMobileNavHeader();
    });

    // 2. Bind hamburger toggle button
    const hamburgerBtn = document.getElementById('mobile-hamburger-btn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileSidebar();
        });
    }

    // 3. Bind Sidebar header buttons: Settings and Close
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMobileSidebar();
        });
    }

    const sidebarSettingsBtn = document.getElementById('sidebar-settings-btn');
    if (sidebarSettingsBtn) {
        sidebarSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMobileSidebar();
            toggleSettings(true);
        });
    }

    // 4. Bind Settings close button
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    if (settingsCloseBtn) {
        settingsCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSettings(false);
        });
    }

    // 5. Bind sidebar backdrop click to dismiss drawer or settings
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            closeMobileSidebar();
            toggleSettings(false);
        });
    }

    // 6. Bind mobile search button to open page palette
    const searchBtn = document.getElementById('mobile-search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openMobilePagePalette();
        });
    }

    // 7. Bind search palette close button and overlay backdrop click
    const paletteCloseBtn = document.getElementById('mobile-palette-close-btn');
    if (paletteCloseBtn) {
        paletteCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMobilePagePalette();
        });
    }

    const paletteOverlay = document.getElementById('mobile-page-palette-overlay');
    if (paletteOverlay) {
        paletteOverlay.addEventListener('click', (e) => {
            if (e.target === paletteOverlay) {
                closeMobilePagePalette();
            }
        });
    }

    // 8. Bind search input typing & keyboard navigation (Arrows, Enter, Esc)
    const paletteInput = document.getElementById('mobile-palette-input');
    if (paletteInput) {
        paletteInput.addEventListener('input', (e) => {
            selectedPaletteIndex = 0;
            renderMobilePaletteResults(e.target.value);
        });

        paletteInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeMobilePagePalette();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (currentFilteredFiles.length > 0) {
                    selectedPaletteIndex = (selectedPaletteIndex + 1) % currentFilteredFiles.length;
                    renderMobilePaletteResults(paletteInput.value);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (currentFilteredFiles.length > 0) {
                    selectedPaletteIndex = (selectedPaletteIndex - 1 + currentFilteredFiles.length) % currentFilteredFiles.length;
                    renderMobilePaletteResults(paletteInput.value);
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentFilteredFiles.length > 0 && currentFilteredFiles[selectedPaletteIndex]) {
                    state.openTab(currentFilteredFiles[selectedPaletteIndex]);
                    closeMobilePagePalette();
                    closeMobileSidebar();
                }
            }
        });
    }

    // Global Esc key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isPaletteOpen) {
                closeMobilePagePalette();
            } else {
                closeMobileSidebar();
                toggleSettings(false);
            }
        }
    });

    // Initial header render
    updateMobileNavHeader();

}
