import { initRouter } from './core/router.js?v=5';
import { initSidebar } from './components/sidebar.js?v=5';
import { initTheme } from './features/theme-engine.js';
import { initPalette } from './components/command-palette.js';
import { initShortcuts } from './features/keyboard-shortcuts.js';
import { initCursorEngine } from './features/cursor-engine.js';
import { initPetCompanions } from './features/pet-companion.js';
import { initUiPolish } from './features/ui-polish.js';
import { initTerminal } from './components/terminal.js';
import { api } from './core/api.js?v=5';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme System
    initTheme();
    initPalette();
    initShortcuts();
    initCursorEngine();
    initPetCompanions();
    initUiPolish();

    // Initialize the router which wires up state to UI
    initRouter();
    
    // Fetch initial data and render sidebar
    initSidebar();

    // Initialize Terminal
    initTerminal();

    // Fire initial page view analytics event
    api.postAnalyticsEvent('page_view', window.location.pathname);
});
