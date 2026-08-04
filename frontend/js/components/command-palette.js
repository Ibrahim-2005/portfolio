// components/command-palette.js
// Handles the Ctrl+Shift+P overlay and theme selection logic

import { themes, setTheme, getCurrentTheme } from '../features/theme-engine.js';

let isPaletteOpen = false;
let selectedIndex = 0;
let filteredThemes = [];

export function initPalette() {
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('cmd-input');
    const toggleBtn = document.getElementById('status-theme-toggle');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            openPalette();
        });
    }

    // Close on click outside
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePalette();
        }
    });

    // Input filtering
    input.addEventListener('input', (e) => {
        filterThemes(e.target.value);
    });

    // Keyboard navigation within palette
    input.addEventListener('keydown', (e) => {
        if (!isPaletteOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, filteredThemes.length - 1);
            renderList();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            renderList();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredThemes.length > 0) {
                setTheme(filteredThemes[selectedIndex].id);
                closePalette();
            }
        }
    });
}

export function togglePalette() {
    if (isPaletteOpen) closePalette();
    else openPalette();
}

export function openPalette() {
    isPaletteOpen = true;
    const overlay = document.getElementById('command-palette-overlay');
    const input = document.getElementById('cmd-input');
    
    overlay.classList.add('visible');
    input.value = '';
    filterThemes('');
    input.focus();
}

export function closePalette() {
    isPaletteOpen = false;
    const overlay = document.getElementById('command-palette-overlay');
    overlay.classList.remove('visible');
}

function filterThemes(query) {
    const q = query.toLowerCase().trim();
    if (q === '') {
        filteredThemes = [...themes];
    } else {
        filteredThemes = themes.filter(t => t.name.toLowerCase().includes(q));
    }
    
    // Try to select the currently active theme if it's in the filtered list
    const currentThemeId = getCurrentTheme();
    const activeIndex = filteredThemes.findIndex(t => t.id === currentThemeId);
    selectedIndex = activeIndex !== -1 ? activeIndex : 0;
    
    renderList();
}

function renderList() {
    const listEl = document.getElementById('cmd-list');
    listEl.innerHTML = '';
    
    if (filteredThemes.length === 0) {
        listEl.innerHTML = '<div class="cmd-item" style="color:var(--fg-muted);">No themes found</div>';
        return;
    }

    filteredThemes.forEach((theme, idx) => {
        const item = document.createElement('div');
        item.className = `cmd-item ${idx === selectedIndex ? 'selected' : ''}`;
        
        const label = document.createElement('span');
        label.textContent = theme.name;
        
        // Indicate active theme
        if (theme.id === getCurrentTheme()) {
            const check = document.createElement('span');
            check.textContent = '✓';
            check.style.opacity = '0.7';
            item.appendChild(label);
            item.appendChild(check);
        } else {
            item.appendChild(label);
        }

        item.addEventListener('mouseenter', () => {
            selectedIndex = idx;
            renderList();
        });

        item.addEventListener('click', () => {
            setTheme(theme.id);
            closePalette();
        });

        listEl.appendChild(item);
    });
    
    // Scroll into view
    const selectedEl = listEl.querySelector('.selected');
    if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
    }
}
