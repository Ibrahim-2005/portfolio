// core/state.js - Manages application state

class State {
    constructor() {
        this.openTabs = []; // Array of file nodes: { id, slug, title, icon, type }
        this.activeTabId = null;
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this));
    }

    openTab(fileNode) {
        const existingTab = this.openTabs.find(t => t.id === fileNode.id);
        
        if (!existingTab) {
            this.openTabs.push(fileNode);
        }
        this.activeTabId = fileNode.id;
        this.notify();
    }

    closeTab(tabId) {
        const index = this.openTabs.findIndex(t => t.id === tabId);
        if (index !== -1) {
            this.openTabs.splice(index, 1);
            if (this.activeTabId === tabId) {
                // Determine new active tab
                if (this.openTabs.length > 0) {
                    const newIndex = index > 0 ? index - 1 : 0;
                    this.activeTabId = this.openTabs[newIndex].id;
                } else {
                    this.activeTabId = null;
                }
            }
            this.notify();
        }
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
