import { api } from "../core/api.js";

export async function renderAbout() {
  const [config, education] = await Promise.all([
    api.getPageConfig("about"),
    api.getEducation(),
  ]);

  if (!config) {
    return '<div style="color:red;padding:2rem;">Failed to load About configuration.</div>';
  }

  const parseMd = (text) => {
    if (!text) return "";

    const highlighted = text.replace(
      /==(.*?)==/g,
      '<span class="highlight">$1</span>',
    );

    return window.marked
      ? window.marked.parse(highlighted)
      : `<p>${highlighted.replace(/\n/g, "<br>")}</p>`;
  };

  const aboutMeHtml = parseMd(config.about_me);
  const closingHtml = parseMd(config.closing_text);

  let focusLeftHtml = "";
  if (config.current_focus && config.current_focus.length > 0) {
    focusLeftHtml = `<ul>${config.current_focus.map((f) => `<li><span class="emoji">${f.emoji}</span> <span>${f.text}</span></li>`).join("")}</ul>`;
  }

  let focusRightHtml = "";
  if (config.currently_learning && config.currently_learning.length > 0) {
    focusRightHtml = `<ul>${config.currently_learning.map((f) => `<li><span class="emoji">${f.emoji}</span> <span>${f.text}</span></li>`).join("")}</ul>`;
  }

  let focusSection = "";
  if (focusLeftHtml || focusRightHtml) {
    focusSection = `
            <h3 class="about-section-heading">CURRENT FOCUS</h3>
            <div class="about-card about-focus-card">
                <div class="about-focus-column">${focusLeftHtml}</div>
                <div class="about-focus-column">${focusRightHtml}</div>
            </div>
        `;
  }

  let educationHtml = "";
  if (education && education.length > 0) {
    educationHtml = `
            <h3 class="about-section-heading">EDUCATION</h3>

            <div class="about-education-timeline">
                ${education
                  .map(
                    (ed) => `
                    <article class="about-education-item">
                        <span class="about-education-node"></span>

                        <div class="about-card about-education-card">
                            <div class="about-education-content">
                                <div class="about-education-title">
                                    ${ed.institution}
                                </div>

                                <div class="about-education-degree">
                                    ${ed.qualification || ed.degree}
                                </div>

                                ${
                                  ed.description
                                    ? `
                                    <div class="about-education-description">
                                        ${parseMd(ed.description)}
                                    </div>
                                `
                                    : ""
                                }
                            </div>

                            <div class="about-education-dates">
                                ${ed.start_year || ""} – ${ed.end_year || "Present"}
                            </div>
                        </div>
                    </article>
                `,
                  )
                  .join("")}
            </div>
        `;
  }

  let closingSection = "";
  if (config.closing_title || closingHtml) {
    closingSection = `
        <h3 class="about-section-heading about-closing-heading">
            ${config.closing_title || "WHAT I BUILD"}
        </h3>

        <div class="about-card about-closing-card">
            <div class="about-closing-section">
                ${closingHtml}
            </div>
        </div>
    `;
  }

  return `
<div class="about-page-container">
    <div class="about-page-comment">${config.top_text || "// about me"}</div>
    <h1 class="about-page-heading">${config.big_text || "About Me"}</h1>
    <h2 class="about-page-tagline">${config.tagline || ""}</h2>
    
    <div class="about-card about-intro-card">
        ${aboutMeHtml}
    </div>
    
    ${focusSection}
    ${educationHtml}
    ${closingSection}
</div>
    `;
}
