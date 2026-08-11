import { adminApi, setToken, getToken, clearToken } from './admin-api.js';
import { loadDashboardData, initMobileMenu } from './admin-dashboard.js';
import { initEditor } from './admin-editor.js';
import { initHomeEditor } from './admin-home.js';
import { initAboutEditor } from './admin-about.js';
import { initProjectsEditor } from './admin-projects.js';
import { initSkillsEditor } from './admin-skills.js';
import { initContactEditor } from './admin-contact.js';
import { initSettingsEditor } from './admin-settings.js';
import { initMessagesEditor } from './admin-messages.js';
import { initGuestbookEditor } from './admin-guestbook.js';
import { initAnalyticsEditor } from './admin-analytics.js';
import { initResumeEditor } from './admin-resume.js';
import { initReadmeEditor } from './admin-readme.js';
import { initCertificatesEditor } from './admin-certificates.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Navigation Tabs logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update buttons
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update panes
            const targetId = `tab-${btn.dataset.tab}`;
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                }
            });

            // Dispatch event for tab loading
            document.dispatchEvent(new CustomEvent('tabChanged', { detail: { tabId: btn.dataset.tab } }));
        });
    });

    // Load appropriate tab data on switch
    document.addEventListener('tabChanged', (e) => {
        const tabId = e.detail.tabId;
        switch(tabId) {
            case 'home':
                initHomeEditor();
                break;
            case 'about':
                initAboutEditor();
                break;
            case 'projects':
                initProjectsEditor();
                break;
            case 'skills':
                initSkillsEditor();
                break;
            case 'contact':
                initContactEditor();
                break;
            case 'readme':
                initReadmeEditor();
                break;
            case 'certificates':
                initCertificatesEditor();
                break;
            case 'resume':
                initResumeEditor();
                break;
            case 'settings':
                initSettingsEditor();
                break;
            case 'messages':
                initMessagesEditor();
                break;
            case 'guestbook':
                initGuestbookEditor();
                break;
            case 'analytics':
                initAnalyticsEditor();
                break;
        }
    });

    // Check auth state on load
    if (getToken()) {
        showDashboard();
    } else {
        showLogin();
    }

    // Login Form Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.textContent = '';
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            const data = await adminApi.login(email, password);
            if (data && data.access_token) {
                setToken(data.access_token);
                showDashboard();
            }
        } catch (error) {
            loginError.textContent = 'Invalid email or password.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        clearToken();
        showLogin();
    });

    function showLogin() {
        dashboardScreen.classList.remove('active');
        loginScreen.classList.add('active');
    }

    async function showDashboard() {
        loginScreen.classList.remove('active');
        dashboardScreen.classList.add('active');
        
        // Initialize dashboard shell features
        initMobileMenu();
        loadDashboardData();
        initEditor();
        await Promise.all([
            initHomeEditor(),
            initAboutEditor(),
            initProjectsEditor(),
            initSkillsEditor(),
            initReadmeEditor(),
            initCertificatesEditor(),
            initContactEditor(),
            initSettingsEditor(),
            initMessagesEditor(),
            initGuestbookEditor(),
            initAnalyticsEditor(),
            initResumeEditor()
        ]);
    }
});
