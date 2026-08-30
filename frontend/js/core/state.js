// core/state.js - Manages application state

const STORAGE_KEY = 'portfolio-tabs';

class State {
    constructor() {
        this.openTabs = []; // Array of file nodes: { id, slug, title, icon, type }
        this.activeTabId = null;
        this.listeners = [];
        this.fallbackNodeProvider = null;
        this.isRestored = false;
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
        return () => this.unsubscribe(listener);
    }

    unsubscribe(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    notify() {
        this.saveTabs();
        this.listeners.forEach(listener => listener(this));
    }

    saveTabs() {
        if (!this.isRestored) return;
        if (typeof localStorage === 'undefined') return;
        try {
            const openTabs = this.openTabs
                .filter(t => t && (t.slug || t.id !== undefined))
                .map(t => t.slug || t.id);

            const activeTab = this.getActiveTab();
            const activeTabIdentifier = activeTab ? (activeTab.slug || activeTab.id) : null;

            const data = {
                openTabs,
                activeTab: activeTabIdentifier
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save tab state to localStorage', e);
        }
    }

    restorePersistedTabs(availableNodes = []) {
        this.isRestored = false;
        let loadedData = null;

        if (typeof localStorage !== 'undefined') {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    loadedData = JSON.parse(raw);
                }
            } catch (err) {
                console.warn('Corrupted tab state in localStorage, falling back to home.py', err);
                loadedData = null;
            }
        }

        const resolveNode = (identifier) => {
            if (identifier === null || identifier === undefined) return null;
            if (identifier === 'shortcuts' || identifier === 'virtual-shortcuts') {
                return {
                    id: 'virtual-shortcuts',
                    slug: 'shortcuts',
                    title: 'Keyboard Shortcuts',
                    type: 'page',
                    icon: '⌨',
                    virtual: true
                };
            }
            if (identifier === 'education' || identifier === 'virtual-education') {
                return {
                    id: 'education',
                    slug: 'education',
                    title: 'Education',
                    extension: '.edu',
                    type: 'page'
                };
            }
            return availableNodes.find(n =>
                (n.slug && n.slug === identifier) ||
                (n.id !== undefined && (n.id === identifier || String(n.id) === String(identifier)))
            ) || null;
        };

        let restoredTabs = [];
        let desiredActiveIdentifier = null;

        if (loadedData && Array.isArray(loadedData.openTabs)) {
            desiredActiveIdentifier = loadedData.activeTab !== undefined ? loadedData.activeTab : loadedData.activeTabId;
            const seenIds = new Set();

            for (const item of loadedData.openTabs) {
                const node = resolveNode(item);
                if (node && !seenIds.has(node.id)) {
                    seenIds.add(node.id);
                    restoredTabs.push(node);
                }
            }
        }

        // Fallback if no valid tabs restored (Cases B, C, D)
        if (restoredTabs.length === 0) {
            const fallback = this.getFallbackNode();
            if (fallback) {
                restoredTabs = [fallback];
                desiredActiveIdentifier = fallback.slug || fallback.id;
            }
        }

        this.openTabs = restoredTabs;

        // Resolve active tab
        let activeNode = resolveNode(desiredActiveIdentifier);
        if (!activeNode || !this.openTabs.some(t => t.id === activeNode.id)) {
            activeNode = this.openTabs[0];
        }

        this.activeTabId = activeNode ? activeNode.id : null;
        this.isRestored = true;

        // Save clean normalized state
        this.saveTabs();

        // Notify router & UI listeners
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

    reorderTabs(fromIndex, toIndex) {
        if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 ||
            fromIndex >= this.openTabs.length || toIndex >= this.openTabs.length) return;
        const [movedTab] = this.openTabs.splice(fromIndex, 1);
        this.openTabs.splice(toIndex, 0, movedTab);
        this.notify();
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
