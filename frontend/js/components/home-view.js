import { api } from "../core/api.js";
import { openTabBySlug } from "./sidebar.js?v=5";

// Expose navigation helper globally so inline onclick can use it
window.navigateTab = (slug) => {
  openTabBySlug(slug);
};

export async function renderHome() {
  const config = await api.getPageConfig("home");

  if (!config) {
    return '<div style="color:red;padding:2rem;">Failed to load Home configuration.</div>';
  }

  const rolesHtml =
    config.roles && config.roles.length > 0
      ? config.roles
          .map((r) => `<span class="badge">${r.label}</span>`)
          .join("\n        ")
      : "";

  const socialLinksHtml =
    config.social_links && config.social_links.length > 0
      ? `<div class="home-socials" style="margin-top: 1.5rem; display: flex; gap: 20px; align-items: center;">` +
        config.social_links
          .filter((s) => s.enabled)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(
            (s) =>
              `<a href="${s.url}" target="_blank" style="color: var(--fg-muted); text-decoration: none; font-size: 1.2rem; transition: color 0.2s;" onmouseover="this.style.color='var(--fg-default)'" onmouseout="this.style.color='var(--fg-muted)'" title="${s.platform}">${s.icon || s.platform}</a>`,
          )
          .join("") +
        `</div>`
      : "";

  return `
<div class="home-content">
    <div class="home-comment">${config.top_text || "// main.py"}</div>
    <h1 class="home-title">${config.name || "Mohamed Ibrahim Y"}</h1>
    <h2 class="home-tagline">${config.tagline || "Building real, working software 🚀"}</h2>
    
    <div class="home-badges">
        ${rolesHtml}
    </div>
    
    <p class="home-intro">${config.intro || ""}</p>
    
    <div class="home-ctas">
        <button class="cta-button primary" onclick="window.navigateTab('projects')">${config.action_projects_label || "Projects"}</button>
        <button class="cta-button" onclick="window.navigateTab('about')">${config.action_about_label || "About Me"}</button>
        <button class="cta-button" onclick="window.navigateTab('contact')">${config.action_contact_label || "Contact"}</button>
    </div>
    
    ${socialLinksHtml}
    

</div>
    `;
}
