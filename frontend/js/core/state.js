// core/state.js - Manages application state

class State {
    constructor() {
        this.openTabs = []; // Array of file nodes: { id, slug, title, icon, type }
        this.activeTabId = null;
        this.listeners = [];
        this.fallbackNodeProvider = null;
    }

    setFallbackNodeProvider(provider) {
        this.fallbackNodeProvider = provider;
    }

    isHomeNode(node) {
        if (!node) return false;
        const slug = (node.slug || '').toLowerCase();
        const title = (node.title || node.label || node.name || '').toLowerCase();
        return slug === 'home' || title === 'home' || title === 'home.py';
    }

    getFallbackNode() {
        if (typeof this.fallbackNodeProvider === 'function') {
            const node = this.fallbackNodeProvider();
            if (node) return node;
        }
        return {
            id: 1,
            title: 'home',
            slug: 'home',
            type: 'page',
            sort_order: 1,
            extension: '.py'
        };
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this));
    }

    openTab(fileNode) {
        if (!fileNode) return;
        const existingTab = this.openTabs.find(t => t.id === fileNode.id || (t.slug && t.slug === fileNode.slug));
        
        if (!existingTab) {
            this.openTabs.push(fileNode);
            this.activeTabId = fileNode.id;
        } else {
            this.activeTabId = existingTab.id;
        }
        this.notify();
    }

    closeTab(tabId) {
        const index = this.openTabs.findIndex(t => t.id === tabId);
        if (index === -1) return;

        // If only home.py is open, prevent closing it (workspace must never have 0 tabs)
        if (this.openTabs.length === 1 && this.isHomeNode(this.openTabs[0])) {
            return;
        }

        // If closing the last remaining non-home tab, restore home.py fallback
        if (this.openTabs.length === 1) {
            this.openTabs.splice(index, 1);
            const fallback = this.getFallbackNode();
            this.openTabs = [fallback];
            this.activeTabId = fallback.id;
            this.notify();
            return;
        }

        // Multiple tabs open: close tab normally
        this.openTabs.splice(index, 1);
        if (this.activeTabId === tabId) {
            if (this.openTabs.length > 0) {
                const newIndex = index > 0 ? index - 1 : 0;
                this.activeTabId = this.openTabs[newIndex].id;
            } else {
                const fallback = this.getFallbackNode();
                this.openTabs = [fallback];
                this.activeTabId = fallback.id;
            }
        }
        this.notify();
    }

    closeAllTabs() {
        this.openTabs = [];
        const fallback = this.getFallbackNode();
        this.openTabs = [fallback];
        this.activeTabId = fallback.id;
        this.notify();
    }

    activateTab(tabId) {
        if (this.activeTabId !== tabId) {
            this.activeTabId = tabId;
            this.notify();
        }
    }
    
    getActiveTab() {
        return this.openTabs.find(t => t.id === this.activeTabId);
    }

    cycleNextTab() {
        if (this.openTabs.length < 2) return;
        const currentIndex = this.openTabs.findIndex(t => t.id === this.activeTabId);
        const nextIndex = (currentIndex + 1) % this.openTabs.length;
        this.activateTab(this.openTabs[nextIndex].id);
    }

    cyclePrevTab() {
        if (this.openTabs.length < 2) return;
        const currentIndex = this.openTabs.findIndex(t => t.id === this.activeTabId);
        const prevIndex = (currentIndex - 1 + this.openTabs.length) % this.openTabs.length;
        this.activateTab(this.openTabs[prevIndex].id);
    }
}

export const state = new State();
