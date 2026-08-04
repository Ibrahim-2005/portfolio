// frontend/js/main.js
import { initRouter } from './core/router.js';
import { initSidebar } from './components/sidebar.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the router which wires up state to UI
    initRouter();
    
    // Fetch initial data and render sidebar
    initSidebar();
});
