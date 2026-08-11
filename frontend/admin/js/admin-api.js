// admin-api.js - Handles authenticated API calls for the admin dashboard
const API_BASE_URL =
  window.location.port === "5500" ? "http://localhost:8000/api" : "/api";

/**
 * Gets the JWT token from sessionStorage.
 */
export function getToken() {
  return sessionStorage.getItem("portfolio_admin_token");
}

/**
 * Sets the JWT token in sessionStorage.
 */
export function setToken(token) {
  sessionStorage.setItem("portfolio_admin_token", token);
}

/**
 * Clears the JWT token.
 */
export function clearToken() {
  sessionStorage.removeItem("portfolio_admin_token");
}

/**
 * Internal helper to perform fetch and handle 401s globally.
 */
async function performRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Set headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Inject token if available
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      clearToken();
      window.location.reload(); // Force reload to show login screen
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    // Return JSON if there is content, else null
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
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
    return performRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Messages
  getMessages: () => performRequest("/admin/messages"),
  markMessageRead: (id) =>
    performRequest(`/admin/messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_read: true }),
    }),

  // Guestbook
  getGuestbook: () => performRequest("/admin/guestbook"),
  updateGuestbook: (id, data) =>
    performRequest(`/admin/guestbook/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  createSkillDomain: (data) =>
    performRequest("/admin/skill-domains", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSkillDomain: (id, data) =>
    performRequest(`/admin/skill-domains/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSkillDomain: (id) =>
    performRequest(`/admin/skill-domains/${id}`, { method: "DELETE" }),

  // Content Editor
  getContactLinks: () => performRequest("/admin/contact-links"),
  createContactLink: (data) =>
    performRequest("/admin/contact-links", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateContactLink: (id, data) =>
    performRequest(`/admin/contact-links/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteContactLink: (id) =>
    performRequest(`/admin/contact-links/${id}`, { method: "DELETE" }),

  // Sidebar
  getSidebarItems: () => performRequest("/admin/sidebar"),
  updateSidebarItem: (id, data) =>
    performRequest(`/admin/sidebar/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  uploadSidebarIcon: async (id, file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/admin/sidebar/${id}/icon`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (response.status === 401) {
      clearToken();
      window.location.reload();
      throw new Error("Unauthorized");
    }
    return response.json();
  },
  deleteSidebarIcon: (id) =>
    performRequest(`/admin/sidebar/${id}/icon`, { method: "DELETE" }),

  // Singletons (Home, About, Projects, Skills, Contact, Settings)
  getHomeConfig: () => performRequest("/pages/home"),
  updateHomeConfig: (data) =>
    performRequest("/admin/pages/home", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getAboutConfig: () => performRequest("/pages/about"),
  updateAboutConfig: (data) =>
    performRequest("/admin/pages/about", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  // Analytics
  getAnalyticsSummary: () => performRequest("/admin/analytics/summary"),

  // Education
  getEducationAdmin: () => performRequest("/admin/education"),
  createEducation: (data) => performRequest("/admin/education", { method: "POST", body: JSON.stringify(data) }),
  updateEducation: (id, data) => performRequest(`/admin/education/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEducation: (id) => performRequest(`/admin/education/${id}`, { method: "DELETE" }),
  // Contact Config
  getContactConfig: () => performRequest("/pages/contact"),

  updateContactConfig: (data) =>
    performRequest("/admin/pages/contact", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  // Projects
  getProjectsConfig: () => performRequest("/pages/projects"),

  updateProjectsConfig: (data) =>
    performRequest("/admin/pages/projects", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getProjects: () => performRequest("/projects"),

  createProject: (data) =>
    performRequest("/admin/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProject: (id, data) =>
    performRequest(`/admin/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteProject: (id) =>
    performRequest(`/admin/projects/${id}`, {
      method: "DELETE",
    }),
  // Skills
  getSkillsConfig: () => performRequest("/pages/skills"),

  updateSkillsConfig: (data) =>
    performRequest("/admin/pages/skills", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getSkillDomains: () => performRequest("/admin/skill-domains"),

  getAdminSkills: () => performRequest("/admin/skills"),

  createSkill: (data) =>
    performRequest("/admin/skills", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateSkill: (id, data) =>
    performRequest(`/admin/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSkill: (id) =>
    performRequest(`/admin/skills/${id}`, {
      method: "DELETE",
    }),

  getReadmeConfig: () => performRequest("/admin/pages/readme"),

  updateReadmeConfig: (data) =>
    performRequest("/admin/pages/readme", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  // --- Certificates Config APIs ---
  getCertificatesConfig: () => performRequest("/admin/pages/certificates"),
  updateCertificatesConfig: (data) =>
    performRequest("/admin/pages/certificates", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getResumeConfig: () => performRequest("/pages/resume"),

  updateResumeConfig: (data) =>
    performRequest("/admin/pages/resume", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  // --- Resume ---
  uploadResumePDF: async (file) => {
    const token = getToken();

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/admin/resume/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (response.status === 401) {
      clearToken();
      window.location.reload();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    return response.json();
  },
  // --- Public Settings APIs ---
  getPublicSettings: () => performRequest("/pages/settings"),
  updatePublicSettings: (data) =>
    performRequest("/admin/pages/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
