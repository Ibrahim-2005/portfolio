// features/keyboard-shortcuts.js
// Handles global keyboard shortcuts like Ctrl+Shift+P, Ctrl+P, Ctrl+B, etc.

import { togglePalette, closePalette, openPaletteWithMode, isPaletteOpen } from '../components/command-palette.js';
import { toggleTerminal, closeTerminal, isTerminalOpen } from '../components/terminal.js';
import { toggleSidebar } from '../components/sidebar.js';
import { state } from '../core/state.js';

let chordState = null;
let chordTimeout = null;

export function initShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Exclude inputs, unless it's the Escape key
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
        
        if (isInputFocused && e.key !== 'Escape') {
            // Reset chord if input focused
            chordState = null;
            return;
        }

        // --- Chords (Multi-key sequences like Ctrl+K, Ctrl+T) ---
        if (chordState === 'CtrlK') {
            clearTimeout(chordTimeout);
            chordState = null;
            
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
                e.preventDefault();
                openPaletteWithMode('themes');
                return;
            }
            // If they pressed something else, just fall through
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            chordState = 'CtrlK';
            // Timeout chord after 2 seconds
            chordTimeout = setTimeout(() => { chordState = null; }, 2000);
            return;
        }

        // --- Single shortcuts ---

        // Ctrl+Shift+P / Cmd+Shift+P -> Command Palette
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            openPaletteWithMode('commands');
            return;
        }

        // Ctrl+P / Cmd+P -> Quick Open (Files)
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            openPaletteWithMode('files');
            return;
        }

        // Ctrl+` -> Toggle Terminal
        if ((e.ctrlKey || e.metaKey) && e.key === '`') {
            e.preventDefault();
            toggleTerminal();
            return;
        }

        // Ctrl+B / Cmd+B -> Toggle Sidebar
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            toggleSidebar();
            return;
        }

        // Ctrl+W / Cmd+W -> Close active tab
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
            e.preventDefault();
            if (state.activeTabId) {
                state.closeTab(state.activeTabId);
            }
            return;
        }

        // Ctrl+Tab and Ctrl+Shift+Tab
        if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                state.cyclePrevTab();
            } else {
                state.cycleNextTab();
            }
            return;
        }

        // Escape
        if (e.key === 'Escape') {
            if (isPaletteOpen()) {
                closePalette();
                return;
            }
            if (isTerminalOpen) {
                closeTerminal();
                return;
            }
            return;
        }

        // --- Sidebar Tree Navigation (Up/Down/Enter) ---
        // Only if the sidebar has focus (e.g. they clicked in it)
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.contains(document.activeElement)) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                navigateSidebarTree(e.key === 'ArrowUp' ? -1 : 1);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                const activeItem = document.activeElement;
                if (activeItem && activeItem.classList.contains('tree-item')) {
                    activeItem.click();
                }
                return;
            }
        }
    });
}

function navigateSidebarTree(direction) {
    // Make tree items focusable if they aren't already
    const items = Array.from(document.querySelectorAll('.tree-item'));
    items.forEach(item => {
        if (!item.hasAttribute('tabindex')) {
            item.setAttribute('tabindex', '0');
        }
    });

    const visibleItems = items.filter(item => {
        // Check if item is inside a collapsed folder
        let parent = item.parentElement;
        while (parent && parent.classList.contains('tree-children')) {
            if (parent.style.display === 'none') return false;
            parent = parent.parentElement;
        }
        return true;
    });

    if (visibleItems.length === 0) return;

    let currentIndex = visibleItems.indexOf(document.activeElement);
    
    // If nothing focused, focus the first item or active item
    if (currentIndex === -1) {
        const activeItem = visibleItems.find(el => el.classList.contains('active'));
        if (activeItem) {
            activeItem.focus();
        } else {
            visibleItems[0].focus();
        }
        return;
    }

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= visibleItems.length) nextIndex = visibleItems.length - 1;

    visibleItems[nextIndex].focus();
}
