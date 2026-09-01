import { initRouter } from './core/router.js';
import { initSidebar } from './components/sidebar.js';
import { initTheme } from './features/theme-engine.js';
import { initPalette } from './components/command-palette.js';
import { initShortcuts } from './features/keyboard-shortcuts.js';
import { initCursorEngine } from './features/cursor-engine.js';
import { initPetCompanions } from './features/pet-companion.js';
import { initUiPolish } from './features/ui-polish.js';
import { initTerminal } from './components/terminal.js';
import { initStatusbar } from './components/statusbar.js';
import { initWindowControls } from './features/window-controls.js';
import { initMenubar } from './components/menubar.js';
import { initActivityBar } from './components/activity-bar.js';
import { initMobileNav, openMobilePagePalette, closeMobilePagePalette, toggleMobileSidebar } from './components/mobile-nav.js';
import { api } from './core/api.js';
import { state } from './core/state.js';
import { setTheme, getCurrentTheme } from './features/theme-engine.js';
import { openTabBySlug } from './components/sidebar.js';
import { openPaletteWithMode, closePalette } from './components/command-palette.js';

// Dev & Test helpers on window
window.state = state;
window.setTheme = setTheme;
window.getCurrentTheme = getCurrentTheme;
window.openTabBySlug = openTabBySlug;
window.openPaletteWithMode = openPaletteWithMode;
window.closePalette = closePalette;
window.openMobilePagePalette = openMobilePagePalette;
window.closeMobilePagePalette = closeMobilePagePalette;
window.toggleMobileSidebar = toggleMobileSidebar;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme System
    initTheme();
    initMenubar();
    initActivityBar();
    initStatusbar();
    initPalette();
    initShortcuts();
    initCursorEngine();
    initPetCompanions();
    initUiPolish();
    initWindowControls();

    // Initialize Mobile/Tablet Navigation & Search Palette
    initMobileNav();

    // Initialize the router which wires up state to UI
    initRouter();
    
    // Fetch initial data and render sidebar
    initSidebar();

    // Initialize Terminal
    initTerminal();

    // Fire initial page view analytics event
    api.postAnalyticsEvent('page_view', window.location.pathname);
});

