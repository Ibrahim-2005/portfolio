// features/theme-engine.js
// Handles reading/writing the active theme to local storage and the DOM

export const themes = [
    { id: 'dark-plus', name: 'Dark+', icon: '🟣', dot: '🟣', color: '#007acc', contrast: 'dark' },
    { id: 'light-plus', name: 'Light+', icon: '🔵', dot: '🔵', color: '#007fd4', contrast: 'light' },
    { id: 'dracula', name: 'Dracula', icon: '🧛', dot: '🧛', color: '#ff79c6', contrast: 'dark' },
    { id: 'one-dark-pro', name: 'One Dark Pro', icon: '⚛️', dot: '⚛️', color: '#61afef', contrast: 'dark' },
    { id: 'monokai', name: 'Monokai', icon: '🦎', dot: '🦎', color: '#f92672', contrast: 'dark' },
    { id: 'nord', name: 'Nord', icon: '❄️', dot: '❄️', color: '#88c0d0', contrast: 'dark' },
    { id: 'solarized-dark', name: 'Solarized Dark', icon: '☀️', dot: '☀️', color: '#2aa198', contrast: 'dark' },
    { id: 'night-owl', name: 'Night Owl', icon: '🦉', dot: '🦉', color: '#c792ea', contrast: 'dark' },
    { id: 'solarized-light', name: 'Solarized Light', icon: '🌞', dot: '🌞', color: '#b58900', contrast: 'light' },
    { id: 'github-light', name: 'GitHub Light', icon: '🐙', dot: '🐙', color: '#0366d6', contrast: 'light' },
    { id: 'project-hail-mary', name: 'Project Hail Mary', icon: '🪨', dot: '🪨', color: '#e58835', description: 'Deep space / science', contrast: 'dark' },
    { id: 'interstellar', name: 'Interstellar', icon: '🚀', dot: '🚀', color: '#f5b971', description: 'Cosmic / cinematic', contrast: 'dark' },
    { id: 'f1', name: 'F1', icon: '🏎️', dot: '🏎️', color: '#e10600', description: 'Racing / telemetry', contrast: 'dark' }
];

export function initTheme() {
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark-plus';
    setTheme(savedTheme, false);
}

export function setTheme(themeId, save = true) {
    const themeObj = themes.find(t => t.id === themeId);
    if (!themeObj) return;

    // Set the data attribute to cascade CSS vars
    document.documentElement.setAttribute('data-theme', themeId);
    
    // Save to local storage safely
    if (save) {
        try {
            localStorage.setItem('portfolio-theme', themeId);
        } catch (e) {
            console.warn('Failed to persist theme to localStorage', e);
        }
    }
    
    // Update status bar UI
    const themeNameEl = document.getElementById('current-theme-name');
    const themeIconEl = document.getElementById('current-theme-icon');
    if (themeNameEl) {
        themeNameEl.textContent = themeObj.name;
    }
    if (themeIconEl) {
        themeIconEl.textContent = themeObj.icon;
    }

    // Dispatch event for other features to listen to
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeId } }));
}

export function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark-plus';
}
