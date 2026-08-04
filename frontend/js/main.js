import { initRouter } from './core/router.js';
import { initSidebar } from './components/sidebar.js';
import { initTheme } from './features/theme-engine.js';
import { initPalette } from './components/command-palette.js';
import { initShortcuts } from './features/keyboard-shortcuts.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme System
    initTheme();
    initPalette();
    initShortcuts();

    // Initialize the router which wires up state to UI
    initRouter();
    
    // Fetch initial data and render sidebar
    initSidebar();
});
