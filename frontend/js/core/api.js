// core/api.js - Handles all API communication
const API_BASE_URL = 'http://localhost:8000/api';

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
};
