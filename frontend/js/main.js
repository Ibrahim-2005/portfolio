import { initRouter } from './core/router.js';
import { initSidebar } from './components/sidebar.js';
import { initTheme } from './features/theme-engine.js';
import { initPalette } from './components/command-palette.js';
import { initShortcuts } from './features/keyboard-shortcuts.js';
import { initCursorEngine } from './features/cursor-engine.js';
import { initPetCompanions } from './features/pet-companion.js';
import { initUiPolish } from './features/ui-polish.js';
import { initTerminal } from './components/terminal.js';
import { initWindowControls } from './features/window-controls.js';
import { api } from './core/api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme System
    initTheme();
    initPalette();
    initShortcuts();
    initCursorEngine();
    initPetCompanions();
    initUiPolish();
    initWindowControls();

    // Initialize the router which wires up state to UI
    initRouter();
    
    // Fetch initial data and render sidebar
    initSidebar();

    // Initialize Terminal
    initTerminal();

    // Fire initial page view analytics event
    api.postAnalyticsEvent('page_view', window.location.pathname);
});
