// components/terminal.js - Terminal logic and command parser
import { api, API_BASE_URL } from '../core/api.js';
import { openTabBySlug } from './sidebar.js';
import { setTheme, themes } from '../features/theme-engine.js';

export let isTerminalOpen = false;
let termInput = null;
let terminalPanel = null;
let terminalBody = null;
let termOutput = null;
let termSuggestions = null;
let terminalSessionsBar = null;

const ALL_COMMANDS = [
    'help',
    'whoami',
    'about',
    'education',
    'skills',
    'projects',
    'resume',
    'contact',
    'socials',
    'theme',
    'clear',
    'sudo hire-me'
];

// Multiple sessions architecture
let sessions = [
    {
        id: 1,
        name: '1: bash',
        history: [],
        historyIndex: 0,
        outputHtml: '<div class="terminal-line system">PortfolioOS Terminal v1.0.0 — Type <span class="term-cmd-highlight">help</span> to view available commands.</div>',
        draft: ''
    }
];
let activeSessionId = 1;
let nextSessionNum = 2;

// Tab completion state
let tabSession = null;

function getActiveSession() {
    if (sessions.length === 0) {
        sessions = [
            {
                id: 1,
                name: '1: bash',
                history: [],
                historyIndex: 0,
                outputHtml: '<div class="terminal-line system">PortfolioOS Terminal v1.0.0 — Type <span class="term-cmd-highlight">help</span> to view available commands.</div>',
                draft: ''
            }
        ];
        activeSessionId = 1;
        nextSessionNum = 2;
    }
    return sessions.find(s => s.id === activeSessionId) || sessions[0];
}

function renderSessionsBar() {
    if (!terminalSessionsBar) {
        terminalSessionsBar = document.getElementById('terminal-sessions-bar');
    }
    if (!terminalSessionsBar) return;

    terminalSessionsBar.innerHTML = '';
    sessions.forEach(sess => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `term-session-tab ${sess.id === activeSessionId ? 'active' : ''}`;
        btn.dataset.sessionId = String(sess.id);
        btn.title = `Session: ${sess.name}`;

        const dot = document.createElement('span');
        dot.className = 'session-dot';
        dot.textContent = '●';
        btn.appendChild(dot);

        const title = document.createElement('span');
        title.className = 'term-session-title';
        title.textContent = ` ${sess.name}`;
        btn.appendChild(title);

        const closeBtn = document.createElement('span');
        closeBtn.className = 'term-session-close-btn';
        closeBtn.textContent = '×';
        closeBtn.title = `Close ${sess.name}`;
        closeBtn.setAttribute('role', 'button');
        closeBtn.setAttribute('aria-label', `Close ${sess.name}`);
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeTerminalSession(sess.id);
        });
        btn.appendChild(closeBtn);

        btn.addEventListener('click', (e) => {
            if (e.target.closest('.term-session-close-btn')) return;
            e.stopPropagation();
            switchSession(sess.id);
        });

        terminalSessionsBar.appendChild(btn);
    });
}

export function closeTerminalSession(sessionId) {
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx === -1) return;

    // Save current active draft if available
    const active = getActiveSession();
    if (active && termInput && active.id === activeSessionId) {
        active.draft = termInput.value;
    }

    if (sessions.length === 1) {
        // Last session closed: close the entire terminal panel cleanly
        closeTerminal();

        // Reset to a clean initial session so reopening gives a fresh usable session
        sessions = [
            {
                id: 1,
                name: '1: bash',
                history: [],
                historyIndex: 0,
                outputHtml: '<div class="terminal-line system">PortfolioOS Terminal v1.0.0 — Type <span class="term-cmd-highlight">help</span> to view available commands.</div>',
                draft: ''
            }
        ];
        activeSessionId = 1;
        nextSessionNum = 2;

        if (termOutput) {
            termOutput.innerHTML = sessions[0].outputHtml;
        }
        if (termInput) {
            termInput.value = '';
        }
        if (termSuggestions) {
            termSuggestions.innerHTML = '';
        }
        tabSession = null;
        renderSessionsBar();
        return;
    }

    const wasActive = (sessionId === activeSessionId);
    sessions.splice(idx, 1);

    if (wasActive) {
        // Rule: previous session if available, otherwise next session
        const newActiveIdx = idx > 0 ? idx - 1 : 0;
        const newActiveSession = sessions[newActiveIdx];
        activeSessionId = newActiveSession.id;

        if (termOutput) {
            termOutput.innerHTML = newActiveSession.outputHtml;
        }
        if (termInput) {
            termInput.value = newActiveSession.draft || '';
            termInput.focus();
        }
        if (termSuggestions) {
            termSuggestions.innerHTML = '';
        }
        tabSession = null;
    }

    renderSessionsBar();
}

export function switchSession(sessionId) {
    if (sessionId === activeSessionId) return;

    // Save current active session
    const current = getActiveSession();
    if (current) {
        current.outputHtml = termOutput ? termOutput.innerHTML : '';
        current.draft = termInput ? termInput.value : '';
    }

    const target = sessions.find(s => s.id === sessionId);
    if (!target) return;

    activeSessionId = target.id;

    if (termOutput) {
        termOutput.innerHTML = target.outputHtml;
    }
    if (termInput) {
        termInput.value = target.draft || '';
    }
    if (termSuggestions) {
        termSuggestions.innerHTML = '';
    }
    tabSession = null;

    renderSessionsBar();

    if (termInput) {
        termInput.focus();
    }
}

export function clearTerminal() {
    if (!termOutput) {
        termOutput = document.querySelector('.terminal-output');
    }
    if (termOutput) {
        termOutput.innerHTML = '';
    }

    // Reset history completely for active session
    const session = getActiveSession();
    if (session) {
        session.history = [];
        session.historyIndex = 0;
        session.draft = '';
        session.outputHtml = '';
    }

    if (termInput) {
        termInput.value = '';
        termInput.focus();
    }
    if (termSuggestions) {
        termSuggestions.innerHTML = '';
    }
    tabSession = null;
}

export function newTerminalSession() {
    openTerminal();

    // Save current active session
    const current = getActiveSession();
    if (current) {
        current.outputHtml = termOutput ? termOutput.innerHTML : '';
        current.draft = termInput ? termInput.value : '';
    }

    const newId = Date.now();
    const newSession = {
        id: newId,
        name: `${nextSessionNum}: bash`,
        history: [],
        historyIndex: 0,
        outputHtml: `<div class="terminal-line system">PortfolioOS Terminal v1.0.0 (session: ${nextSessionNum}) — Type <span class="term-cmd-highlight">help</span> for available commands.</div>`,
        draft: ''
    };
    nextSessionNum++;
    sessions.push(newSession);
    activeSessionId = newId;

    if (termOutput) {
        termOutput.innerHTML = newSession.outputHtml;
    }
    if (termInput) {
        termInput.value = '';
        termInput.focus();
    }
    if (termSuggestions) {
        termSuggestions.innerHTML = '';
    }
    tabSession = null;

    renderSessionsBar();
}

export function toggleMaximizeTerminal() {
    if (!terminalPanel) {
        terminalPanel = document.getElementById('terminal-panel');
    }
    if (!terminalPanel) return;

    const isCurrentlyMax = terminalPanel.classList.contains('is-maximized');
    if (isCurrentlyMax) {
        terminalPanel.classList.remove('is-maximized');
        terminalPanel.style.height = '';
    } else {
        terminalPanel.classList.add('is-maximized');
        terminalPanel.style.height = '';
    }

    const maxBtn = document.querySelector('.term-maximize-btn');
    if (maxBtn) {
        const isMax = terminalPanel.classList.contains('is-maximized');
        maxBtn.textContent = isMax ? '⤡' : '⤢';
        maxBtn.setAttribute('title', isMax ? 'Restore Panel Size' : 'Maximize Panel Size');
        maxBtn.setAttribute('aria-label', isMax ? 'Restore Panel Size' : 'Maximize Panel Size');
    }
    if (termInput) {
        termInput.focus();
    }
}

export const toggleTerminal = () => {
    if (!terminalPanel) {
        terminalPanel = document.getElementById('terminal-panel');
    }
    if (!termInput) {
        termInput = document.getElementById('terminal-input');
    }
    if (!terminalPanel) return;

    const isCurrentlyCollapsed = terminalPanel.classList.contains('collapsed');

    if (isCurrentlyCollapsed) {
        terminalPanel.classList.remove('collapsed');
        isTerminalOpen = true;
        if (termInput) {
            setTimeout(() => termInput.focus(), 30);
        }
    } else {
        closeTerminal();
    }
    document.dispatchEvent(new CustomEvent('terminalToggled', { detail: { isOpen: isTerminalOpen } }));
};

export const openTerminal = () => {
    if (!terminalPanel) {
        terminalPanel = document.getElementById('terminal-panel');
    }
    if (!termInput) {
        termInput = document.getElementById('terminal-input');
    }
    if (terminalPanel && terminalPanel.classList.contains('collapsed')) {
        terminalPanel.classList.remove('collapsed');
        isTerminalOpen = true;
        document.dispatchEvent(new CustomEvent('terminalToggled', { detail: { isOpen: true } }));
    }
    if (termInput) {
        setTimeout(() => termInput.focus(), 30);
    }
};

export const closeTerminal = () => {
    if (!terminalPanel) {
        terminalPanel = document.getElementById('terminal-panel');
    }
    if (!terminalPanel) return;

    terminalPanel.classList.add('collapsed');
    terminalPanel.classList.remove('is-maximized');
    terminalPanel.style.height = '';
    terminalPanel.style.top = '';
    isTerminalOpen = false;

    const maxBtn = document.querySelector('.term-maximize-btn');
    if (maxBtn) {
        maxBtn.textContent = '⤢';
        maxBtn.setAttribute('title', 'Maximize Panel Size');
        maxBtn.setAttribute('aria-label', 'Maximize Panel Size');
    }

    if (document.activeElement && terminalPanel.contains(document.activeElement)) {
        document.activeElement.blur();
    }
    document.dispatchEvent(new CustomEvent('terminalToggled', { detail: { isOpen: false } }));
};

export const clearTerminalOutput = () => {
    clearTerminal();
};

export const runLastTerminalCommand = () => {
    openTerminal();
    const session = getActiveSession();
    const lastCmd = session.history.length > 0 ? session.history[session.history.length - 1] : 'help';
    printLine(lastCmd, true);
    executeCommand(lastCmd);
};

function printLine(text, isCommand = false, lineType = '') {
    if (!termOutput) {
        termOutput = document.querySelector('.terminal-output');
    }
    if (!termOutput) return;

    const line = document.createElement('div');
    line.className = 'terminal-line';
    if (lineType) {
        line.classList.add(lineType);
    }

    if (isCommand) {
        line.classList.add('command-echo');
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = 'guest@portfolio:~$';
        line.appendChild(promptSpan);

        const cmdSpan = document.createElement('span');
        cmdSpan.className = 'command-text';
        cmdSpan.textContent = text;
        line.appendChild(cmdSpan);
    } else {
        line.textContent = text;
    }

    termOutput.appendChild(line);

    // Save output in active session
    const session = getActiveSession();
    if (session) {
        session.outputHtml = termOutput.innerHTML;
    }

    // Scroll to bottom
    const body = terminalBody || document.getElementById('terminal-body');
    if (body) {
        body.scrollTop = body.scrollHeight;
    }
}

function executeCommand(cmdStr) {
    const args = cmdStr.trim().split(' ').filter(a => a);
    if (args.length === 0) return;

    const session = getActiveSession();
    const cmd = args[0].toLowerCase();

    // Analytics
    try {
        api.postAnalyticsEvent('command', cmdStr);
    } catch (e) {
        // non-blocking
    }

    switch (cmd) {
        case 'help':
            printLine('Available Commands:', false, 'system');
            printLine('  Navigation:  about, education, skills, projects, contact');
            printLine('  Preferences: theme <name> (e.g. theme dracula)');
            printLine('  Actions:     resume, socials, clear');
            printLine('  System:      whoami, sudo hire-me');
            break;

        case 'whoami':
            printLine('Mohamed Ibrahim Y — Full-Stack Engineer & Designer 🚀', false, 'success');
            break;

        case 'about':
        case 'education':
        case 'skills':
        case 'projects':
        case 'contact':
            const success = openTabBySlug(cmd);
            if (success) {
                printLine(`Opening ${cmd}...`, false, 'success');
            } else {
                printLine(`Error: section '${cmd}' not found.`, false, 'error');
            }
            break;

        case 'resume':
            printLine('Downloading resume...', false, 'success');
            const a = document.createElement('a');
            a.href = `${API_BASE_URL}/resume`;
            a.download = 'Resume.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            break;

        case 'socials':
            printLine('GitHub:   https://github.com/Ibrahim-2005');
            printLine('LinkedIn: https://www.linkedin.com/in/mohamed-ibrahim-y/');
            break;

        case 'theme':
            if (args.length > 1) {
                const themeName = args.slice(1).join('-').toLowerCase();
                const themeObj = themes.find(t => t.id === themeName || t.name.toLowerCase() === themeName.replace(/-/g, ' '));

                if (themeObj) {
                    setTheme(themeObj.id, true);
                    printLine(`✓ Switched theme to ${themeObj.name}`, false, 'success');
                } else {
                    printLine(`Error: Theme '${themeName}' not found.`, false, 'error');
                    printLine(`Available themes: ${themes.map(t => t.id).join(', ')}`, false, 'system');
                }
            } else {
                printLine('Available themes:', false, 'system');
                printLine('  ' + themes.map(t => t.id).join(', '));
                printLine('Usage: theme <name> (e.g. theme dracula)');
            }
            break;

        case 'clear':
            clearTerminal();
            break;

        case 'sudo':
            if (args[1] === 'hire-me') {
                printLine('Access granted! Initializing interview protocol... 🚀', false, 'success');
                document.body.style.animation = 'shake 0.5s';
                setTimeout(() => { document.body.style.animation = ''; }, 500);
            } else {
                printLine(`sudo: ${args[1] || ''}: command not found`, false, 'error');
            }
            break;

        default:
            printLine(`Command not found: '${cmd}'. Type 'help' for available commands.`, false, 'error');
    }
}

export function initTerminal() {
    terminalPanel = document.getElementById('terminal-panel');
    termInput = document.getElementById('terminal-input');
    terminalBody = document.getElementById('terminal-body');
    termOutput = document.querySelector('.terminal-output');
    termSuggestions = document.getElementById('terminal-suggestions');
    terminalSessionsBar = document.getElementById('terminal-sessions-bar');

    // Render session tabs
    renderSessionsBar();

    // Header buttons event handling
    const terminalHeader = document.querySelector('.terminal-header');
    if (terminalHeader) {
        terminalHeader.addEventListener('click', (e) => {
            const btn = e.target.closest('.term-action-btn');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();

            if (btn.classList.contains('term-close-btn')) {
                closeTerminal();
            } else if (btn.classList.contains('term-maximize-btn')) {
                toggleMaximizeTerminal();
            } else if (btn.classList.contains('term-clear-btn')) {
                clearTerminal();
            } else if (btn.classList.contains('term-new-btn')) {
                newTerminalSession();
            }
        });
    }

    // Status bar toggle button
    document.querySelectorAll('.term-toggle-status-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTerminal();
        });
    });

    // Dedicated Clickable Input Row: clicking prompt, padding, or empty space focuses input
    const inputLine = document.querySelector('.terminal-input-line');
    if (inputLine) {
        inputLine.addEventListener('click', (e) => {
            if (termInput) {
                termInput.focus();
            }
        });
    }

    // Mobile Keyboard visualViewport Handling
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (isTerminalOpen && window.innerWidth <= 599) {
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

    // Autocomplete Suggestions on input
    if (termInput) {
        termInput.addEventListener('input', () => {
            tabSession = null;
            const val = termInput.value;
            if (!termSuggestions) return;
            termSuggestions.innerHTML = '';

            let matches = [];
            let prefixType = '';

            if (val.toLowerCase().startsWith('theme ')) {
                prefixType = 'theme';
                const query = val.substring(6).trim().toLowerCase();
                matches = themes
                    .filter(t => t.id.startsWith(query) || t.id.includes(query) || t.name.toLowerCase().includes(query))
                    .map(t => t.id);
            } else if (val.trim().length > 0 && !val.includes(' ')) {
                prefixType = 'command';
                const query = val.toLowerCase();
                matches = ALL_COMMANDS.filter(c => c.startsWith(query));
            }

            if (matches.length > 0) {
                matches.forEach(item => {
                    const span = document.createElement('span');
                    span.className = 'suggestion-pill';
                    span.textContent = item;
                    span.addEventListener('click', (e) => {
                        e.stopPropagation();
                        termInput.value = prefixType === 'theme' ? `theme ${item}` : item;
                        termInput.focus();
                        termSuggestions.innerHTML = '';
                        tabSession = null;
                    });
                    termSuggestions.appendChild(span);
                });
            }
        });

        // Keydown handling: Enter, ArrowUp, ArrowDown, Tab, Escape
        termInput.addEventListener('keydown', (e) => {
            const session = getActiveSession();

            // Reset tab completion cycling on any non-Tab key
            if (e.key !== 'Tab') {
                tabSession = null;
            }

            if (e.key === 'Enter') {
                const val = termInput.value;
                printLine(val, true);
                termInput.value = '';
                if (termSuggestions) termSuggestions.innerHTML = '';

                const trimmed = val.trim();
                if (trimmed) {
                    if (session.history.length === 0 || session.history[session.history.length - 1] !== trimmed) {
                        session.history.push(trimmed);
                    }
                }
                session.historyIndex = session.history.length;
                session.draft = '';

                executeCommand(val);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (session.history.length === 0) return;
                if (session.historyIndex === session.history.length) {
                    session.draft = termInput.value;
                }
                if (session.historyIndex > 0) {
                    session.historyIndex--;
                    termInput.value = session.history[session.historyIndex];
                    setTimeout(() => {
                        termInput.selectionStart = termInput.selectionEnd = termInput.value.length;
                    }, 0);
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (session.history.length === 0) return;
                if (session.historyIndex < session.history.length - 1) {
                    session.historyIndex++;
                    termInput.value = session.history[session.historyIndex];
                    setTimeout(() => {
                        termInput.selectionStart = termInput.selectionEnd = termInput.value.length;
                    }, 0);
                } else if (session.historyIndex === session.history.length - 1) {
                    session.historyIndex = session.history.length;
                    termInput.value = session.draft || '';
                    setTimeout(() => {
                        termInput.selectionStart = termInput.selectionEnd = termInput.value.length;
                    }, 0);
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const val = termInput.value;

                // Invalidate stale tabSession if input text was modified
                if (tabSession) {
                    const expectedVal = tabSession.isTheme
                        ? `theme ${tabSession.matches[tabSession.matchIndex]}`
                        : tabSession.matches[tabSession.matchIndex];
                    if (val !== expectedVal) {
                        tabSession = null;
                    }
                }

                if (!tabSession) {
                    const isTheme = val.toLowerCase().startsWith('theme ');
                    let query = '';
                    let matches = [];

                    if (isTheme) {
                        query = val.substring(6).trim().toLowerCase();
                        matches = themes
                            .map(t => t.id)
                            .filter(id => id.startsWith(query));
                    } else if (val.trim().length > 0 && !val.includes(' ')) {
                        query = val.toLowerCase();
                        matches = ALL_COMMANDS.filter(c => c.startsWith(query));
                    }

                    if (matches.length > 0) {
                        tabSession = {
                            isTheme,
                            originalQuery: query,
                            matches,
                            matchIndex: 0
                        };
                        const match = matches[0];
                        termInput.value = isTheme ? `theme ${match}` : match;
                    }
                } else {
                    // Subsequent Tab press: cycle matches
                    tabSession.matchIndex = (tabSession.matchIndex + 1) % tabSession.matches.length;
                    const match = tabSession.matches[tabSession.matchIndex];
                    termInput.value = tabSession.isTheme ? `theme ${match}` : match;
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                if (termSuggestions && termSuggestions.children.length > 0) {
                    e.stopPropagation();
                    termSuggestions.innerHTML = '';
                } else {
                    closeTerminal();
                }
            }
        });
    }
}
