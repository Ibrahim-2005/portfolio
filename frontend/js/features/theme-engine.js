// features/theme-engine.js
// Handles reading/writing the active theme to local storage and the DOM

export const themes = [
    { id: 'dark-plus', name: 'Dark+', dot: '🟣', contrast: 'dark' },
    { id: 'light-plus', name: 'Light+', dot: '🔵', contrast: 'light' },
    { id: 'dracula', name: 'Dracula', dot: '🧛', contrast: 'dark' },
    { id: 'one-dark-pro', name: 'One Dark Pro', dot: '⚛️', contrast: 'dark' },
    { id: 'monokai', name: 'Monokai', dot: '🦎', contrast: 'dark' },
    { id: 'nord', name: 'Nord', dot: '❄️', contrast: 'dark' },
    { id: 'solarized-dark', name: 'Solarized Dark', dot: '☀️', contrast: 'dark' },
    { id: 'night-owl', name: 'Night Owl', dot: '🦉', contrast: 'dark' },
    { id: 'solarized-light', name: 'Solarized Light', dot: '🌞', contrast: 'light' },
    { id: 'github-light', name: 'GitHub Light', dot: '🐙', contrast: 'light' },
    { id: 'project-hail-mary', name: 'Project Hail Mary', dot: '📚', description: 'Deep space / science', contrast: 'dark' },
    { id: 'interstellar', name: 'Interstellar', dot: '🚀', description: 'Cosmic / cinematic', contrast: 'dark' },
    { id: 'f1', name: 'F1', dot: '🏎️', description: 'Racing / telemetry', contrast: 'dark' }
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

    // Dispatch event for other features to listen to
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeId } }));
}

export function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark-plus';
}
