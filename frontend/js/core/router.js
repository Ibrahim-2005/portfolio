// core/router.js - Coordinates state changes and UI updates
import { state } from './state.js?v=5';
import { renderContent } from '../components/content-pane.js?v=5';
import { renderTabs } from '../components/tabs.js';
import { updateSidebarActive } from '../components/sidebar.js?v=5';

export function initRouter() {
    // When state changes (tab opened, closed, changed), update all dependent UI components
    state.subscribe(() => {
        renderTabs();
        updateSidebarActive();
        renderContent();
    });
}
