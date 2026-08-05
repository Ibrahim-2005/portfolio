// admin-api.js - Handles authenticated API calls for the admin dashboard
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Gets the JWT token from sessionStorage.
 */
export function getToken() {
    return sessionStorage.getItem('portfolio_admin_token');
}

/**
 * Sets the JWT token in sessionStorage.
 */
export function setToken(token) {
    sessionStorage.setItem('portfolio_admin_token', token);
}

/**
 * Clears the JWT token.
 */
export function clearToken() {
    sessionStorage.removeItem('portfolio_admin_token');
}

/**
 * Internal helper to perform fetch and handle 401s globally.
 */
async function performRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Inject token if available
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        
        // Handle 401 Unauthorized globally
        if (response.status === 401) {
            clearToken();
            window.location.reload(); // Force reload to show login screen
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP Error ${response.status}`);
        }

        // Return JSON if there is content, else null
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}

// Admin API Object
export const adminApi = {
    // Auth
    login: (email, password) => {
        return performRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    // Messages
    getMessages: () => performRequest('/admin/messages'),
    markMessageRead: (id) => performRequest(`/admin/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ is_read: true }) }),

    // Guestbook
    getGuestbook: () => performRequest('/admin/guestbook'),
    approveGuestbook: (id) => performRequest(`/admin/guestbook/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) }),
    rejectGuestbook: (id) => performRequest(`/admin/guestbook/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) }),

    // Analytics
    getAnalyticsSummary: () => performRequest('/admin/analytics/summary'),

    // Content Editor (Sections)
    getSections: () => performRequest('/sections'), // Public endpoint is fine for reading
    createSection: (data) => performRequest('/admin/sections', { method: 'POST', body: JSON.stringify(data) }),
    updateSection: (id, data) => performRequest(`/admin/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSection: (id) => performRequest(`/admin/sections/${id}`, { method: 'DELETE' }),

    // Content Editor (Projects)
    getProjects: () => performRequest('/projects'),
    createProject: (data) => performRequest('/admin/projects', { method: 'POST', body: JSON.stringify(data) }),
    updateProject: (id, data) => performRequest(`/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProject: (id) => performRequest(`/admin/projects/${id}`, { method: 'DELETE' }),

    // Content Editor (Skills)
    getSkills: () => performRequest('/skills'),
    createSkill: (data) => performRequest('/admin/skills', { method: 'POST', body: JSON.stringify(data) }),
    updateSkill: (id, data) => performRequest(`/admin/skills/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteSkill: (id) => performRequest(`/admin/skills/${id}`, { method: 'DELETE' })
};
