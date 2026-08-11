// components/terminal.js - Terminal logic and command parser
import { api } from '../core/api.js';
import { openTabBySlug } from './sidebar.js';
import { setTheme, themes } from '../features/theme-engine.js';

export let isTerminalOpen = false;
let termInput;
let terminalPanel;

export const toggleTerminal = () => {
    isTerminalOpen = !isTerminalOpen;
    if (isTerminalOpen) {
        terminalPanel.classList.remove('collapsed');
        termInput.focus();
    } else {
        terminalPanel.classList.add('collapsed');
        terminalPanel.style.height = '';
        terminalPanel.style.top = '';
    }
    document.dispatchEvent(new CustomEvent('terminalToggled', { detail: { isOpen: isTerminalOpen } }));
};

export const closeTerminal = () => {
    if (isTerminalOpen) {
        toggleTerminal();
    }
};

export function initTerminal() {
    terminalPanel = document.getElementById('terminal-panel');
    const toggleBtns = document.querySelectorAll('.term-toggle-status-btn, .term-close-btn');
    termInput = document.getElementById('terminal-input');
    const termOutput = document.querySelector('.terminal-output');
    const termSuggestions = document.getElementById('terminal-suggestions');

    toggleBtns.forEach(btn => btn.addEventListener('click', toggleTerminal));

    // Mobile Keyboard visualViewport Handling
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (isTerminalOpen && window.innerWidth <= 599) {
                // Adjust terminal to fit exactly within the visual viewport (above the keyboard)
                terminalPanel.style.height = `${window.visualViewport.height}px`;
                terminalPanel.style.top = `${window.visualViewport.offsetTop}px`;
            } else {
                terminalPanel.style.height = '';
                terminalPanel.style.top = '';
            }
        });
        
        window.visualViewport.addEventListener('scroll', () => {
            if (isTerminalOpen && window.innerWidth <= 599) {
                terminalPanel.style.top = `${window.visualViewport.offsetTop}px`;
            }
        });
    }

    // Helper to print text to terminal
    const printLine = (text, isCommand = false) => {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        if (isCommand) {
            line.innerHTML = `<span class="prompt">guest@portfolio:~$</span> ${text}`;
        } else {
            line.textContent = text;
        }
        termOutput.appendChild(line);
        termOutput.parentElement.scrollTop = termOutput.parentElement.scrollHeight;
    };

    const clearTerminal = () => {
        termOutput.innerHTML = '';
        printLine('Portfolio v0.1.0 — type \'help\' to get started');
    };

    // Command parser
    const executeCommand = (cmdStr) => {
        const args = cmdStr.trim().split(' ').filter(a => a);
        if (args.length === 0) return;
        
        const cmd = args[0].toLowerCase();

        // Analytics
        api.postAnalyticsEvent('command', cmdStr);

        switch (cmd) {
            case 'help':
                printLine('Available commands:');
                printLine('  help, whoami, about, education, skills, projects');
                printLine('  resume, contact, socials, theme <name>, clear, sudo hire-me');
                break;
            case 'whoami':
                printLine('Mohamed Ibrahim Y - Building real, working software 🚀');
                break;
            case 'about':
            case 'education':
            case 'skills':
            case 'projects':
            case 'contact':
                const success = openTabBySlug(cmd);
                if (success) {
                    printLine(`Opening ${cmd}...`);
                } else {
                    printLine(`Error: section '${cmd}' not found.`);
                }
                break;
            case 'resume':
                printLine('Downloading resume...');
                const a = document.createElement('a');
                a.href = 'assets/resume/Mohamed_ IbrahimY_ Resume.pdf';
                a.download = 'Mohamed_ IbrahimY_ Resume.pdf';
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                break;
            case 'socials':
                printLine('GitHub: https://github.com/ibrahim');
                printLine('LinkedIn: https://linkedin.com/in/ibrahim');
                break;
            case 'theme':
                if (args.length > 1) {
                    const themeName = args.slice(1).join('-').toLowerCase();
                    const themeObj = themes.find(t => t.id === themeName || t.name.toLowerCase() === themeName.replace(/-/g, ' '));
                    
                    if (themeObj) {
                        setTheme(themeObj.id, true);
                        printLine(`Switched theme to ${themeObj.name}`);
                    } else {
                        printLine(`Error: Theme '${themeName}' not found.`);
                        printLine('Type "theme" to see available themes.');
                    }
                } else {
                    printLine('Available themes:');
                    printLine('  ' + themes.map(t => t.id).join(', '));
                    printLine('Usage: theme <name> (e.g. theme dracula)');
                }
                break;
            case 'clear':
                clearTerminal();
                break;
            case 'sudo':
                if (args[1] === 'hire-me') {
                    printLine('Access granted. Initializing interview process...');
                    // Add playful CSS animation to the whole body
                    document.body.style.animation = 'shake 0.5s';
                    setTimeout(() => document.body.style.animation = '', 500);
                } else {
                    printLine(`sudo: ${args[1]}: command not found`);
                }
                break;
            default:
                printLine(`Command not found: ${cmd}`);
                printLine('Type "help" for a list of available commands.');
        }
    };

    // Handle input event for autocomplete
    termInput.addEventListener('input', (e) => {
        const val = termInput.value;
        termSuggestions.innerHTML = ''; // clear

        if (val.toLowerCase().startsWith('theme ')) {
            const query = val.substring(6).toLowerCase();
            const matches = themes.filter(t => t.id.includes(query) || t.name.toLowerCase().includes(query));
            
            if (matches.length > 0) {
                matches.forEach(t => {
                    const span = document.createElement('span');
                    span.className = 'suggestion-pill';
                    span.textContent = t.id;
                    span.onclick = () => {
                        termInput.value = `theme ${t.id}`;
                        termInput.focus();
                        termSuggestions.innerHTML = '';
                    };
                    termSuggestions.appendChild(span);
                });
            } else {
                termSuggestions.textContent = 'No matching themes';
            }
        }
    });

    // Handle Enter key on input
    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = termInput.value;
            printLine(val, true); // echo command
            termInput.value = '';
            termSuggestions.innerHTML = ''; // clear suggestions
            executeCommand(val);
        } else if (e.key === 'Tab') {
            e.preventDefault(); // prevent losing focus
            // simple tab completion for themes
            const val = termInput.value;
            if (val.toLowerCase().startsWith('theme ')) {
                const query = val.substring(6).toLowerCase();
                const matches = themes.filter(t => t.id.startsWith(query));
                if (matches.length === 1) {
                    termInput.value = `theme ${matches[0].id}`;
                }
            }
        }
    });
}
