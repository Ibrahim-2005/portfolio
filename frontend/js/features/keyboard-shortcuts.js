// features/keyboard-shortcuts.js
// Handles global keyboard shortcuts like Ctrl+Shift+P

import { togglePalette, closePalette } from '../components/command-palette.js';

export function initShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+P or Cmd+Shift+P
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
            e.preventDefault(); // Prevent browser print dialog
            togglePalette();
            return;
        }
        
        // Escape to close palette
        if (e.key === 'Escape') {
            closePalette();
            return;
        }
    });
}
