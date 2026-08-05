import { adminApi, setToken, getToken, clearToken } from './admin-api.js';
import { loadDashboardData } from './admin-dashboard.js';
import { initEditor } from './admin-editor.js';

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
        });
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

    function showDashboard() {
        loginScreen.classList.remove('active');
        dashboardScreen.classList.add('active');
        
        // Initialize dashboard data
        loadDashboardData();
        initEditor();
    }
});
