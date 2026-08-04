// core/api.js - Handles all API communication
const API_BASE_URL = 'http://localhost:8000/api';

// Generate or retrieve session ID for analytics
function getSessionId() {
    let sid = sessionStorage.getItem('portfolio_sid');
    if (!sid) {
        sid = 'sid_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        sessionStorage.setItem('portfolio_sid', sid);
    }
    return sid;
}

async function fetchJSON(endpoint) {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
            return null; // Return null on error to handle gracefully
        }
        return await response.json();
    } catch (error) {
        console.error('Network Error:', error);
        return null;
    }
}

export const api = {
    getSections: () => fetchJSON('/sections'),
    getSection: (slug) => fetchJSON(`/sections/${slug}`),
    getProjects: () => fetchJSON('/projects'),
    getSkills: () => fetchJSON('/skills'),
    
    // Analytics
    postAnalyticsEvent: async (eventType, value) => {
        const payload = {
            event_type: eventType,
            value: value,
            session_id: getSessionId()
        };
        try {
            await fetch(`${API_BASE_URL}/analytics/event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Failed to post analytics event:', error);
        }
    }
};
