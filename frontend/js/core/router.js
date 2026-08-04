// core/router.js - Coordinates state changes and UI updates
import { state } from './state.js';
import { renderContent } from '../components/content-pane.js';
import { renderTabs } from '../components/tabs.js';
import { updateSidebarActive } from '../components/sidebar.js';

export function initRouter() {
    // When state changes (tab opened, closed, changed), update all dependent UI components
    state.subscribe(() => {
        renderTabs();
        updateSidebarActive();
        renderContent();
    });
}
