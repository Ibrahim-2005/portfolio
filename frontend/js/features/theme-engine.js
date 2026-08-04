// features/theme-engine.js
// Handles reading/writing the active theme to local storage and the DOM

export const themes = [
    { id: 'dark-plus', name: 'Dark+' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'one-dark-pro', name: 'One Dark Pro' },
    { id: 'monokai', name: 'Monokai' },
    { id: 'nord', name: 'Nord' },
    { id: 'solarized-dark', name: 'Solarized Dark' },
    { id: 'night-owl', name: 'Night Owl' },
    { id: 'light-plus', name: 'Light+' },
    { id: 'solarized-light', name: 'Solarized Light' },
    { id: 'github-light', name: 'GitHub Light' },
    { id: 'project-hail-mary', name: 'Project Hail Mary' },
    { id: 'interstellar', name: 'Interstellar' },
    { id: 'f1', name: 'F1' }
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
    
    // Save to local storage
    if (save) {
        localStorage.setItem('portfolio-theme', themeId);
    }
    
    // Update status bar UI
    const themeNameEl = document.getElementById('current-theme-name');
    if (themeNameEl) {
        themeNameEl.textContent = themeObj.name;
    }
}

export function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark-plus';
}
