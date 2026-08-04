# PRD — PortfolioOS (Product Requirements Document)

## 1. Product Summary
PortfolioOS is a personal developer portfolio site presented as a full VS Code simulation — sidebar file tree, tabbed content panes, a working terminal, and 10 switchable editor themes — backed by a real FastAPI + PostgreSQL service instead of static HTML. The portfolio is itself a demonstrable full-stack project, not just a display case for other projects.

## 2. Problem Statement
Generic portfolio templates blend together in a recruiter's inbox. Ibrahim needs a portfolio that (a) proves backend/full-stack competency through the site's own engineering, not just its written descriptions, and (b) stays approachable for non-technical recruiters and HR who won't know or care what VS Code is.

## 3. Goals
- Get shortlisted for backend/full-stack developer roles
- Present freelance and teaching work credibly alongside technical projects
- Serve as a talking point in interviews — an artifact whose architecture the owner can explain in depth
- Be maintainable long-term without redeploying code for every content change

## 4. Non-Goals (Explicitly Out of Scope for v1)
- Blog/CMS for long-form articles (may be added later as its own section type)
- Multi-user accounts or public user-generated content beyond guestbook + contact
- Native mobile app — responsive web only
- Payment, e-commerce, or scheduling functionality

## 5. Target Users / Audiences
| Audience | Need | Behavior |
|---|---|---|
| Technical recruiter / engineer | Verify real skill, inspect code quality | May open terminal, try commands, check GitHub repo/CI badge |
| Non-technical HR / recruiter | Quickly understand who this person is and what they've built | Needs obvious navigation, doesn't need to "get" VS Code |
| Ibrahim (owner/admin) | Update content without redeploying | Uses hidden admin panel to edit sections, view messages/analytics |

## 6. Key Features (v1)
1. **VS Code-style shell** — sidebar file tree, tabs, status bar, command palette
2. **Sections**: Home, About Me (Bio + Education), Projects, Skills, README, Files (resume + certificates), Contact
3. **13 switchable themes** (10 base: 7 dark + 3 light; plus 3 personal-passion easter-egg themes — Project Hail Mary, Interstellar, F1), persisted client-side
   - Each easter-egg theme includes a matching walking pet companion (Rocky & Grace, a rocket, an F1 car) and a custom themed cursor
4. **Interactive terminal** with a fixed command set (see UI/UX Spec)
5. **Contact form** — stores messages server-side
6. **Guestbook** — visitor messages, admin-moderated before public display
7. **Analytics** — page views and terminal command usage, visible only to admin
8. **Admin CMS** — JWT-protected panel to edit any section's content and to create new sidebar sections/projects/skills without touching code
9. **Resume** — downloadable PDF and an inline-viewable version
10. **GitHub repo link + CI badge** shown on-site (meta signal: "here's the code for this site")

## 7. Featured Projects (Content Scope)
- Job Tracker API (backend REST API)
- Money Tracker / Expense Tracker
- Curated by Afza (e-commerce site)
- Awaken Your Inner Power (life-coaching site)

## 8. Success Criteria
- A recruiter with zero coding background can navigate to About, Projects, Skills, and Contact without confusion, in under 30 seconds each
- A technical reviewer can find and inspect the live GitHub repo and CI status in under 2 clicks
- Ibrahim can add a brand-new project or edit any section's text via the admin panel with zero code changes or redeploys
- Site loads and is usable on a mid-range mobile device

## 9. Constraints
- Solo build, assisted by AI coding tools (Claude Code / Codex)
- Target timeline: 1–2 weeks
- Hosting budget: free/low-cost tier (Render)
- Must reuse the tech stack pattern already proven in Ibrahim's other projects (Flask elsewhere, FastAPI chosen here deliberately as a stack expansion signal)

## 10. Risks
- **Scope creep**: CMS + terminal + 10 themes + analytics is real engineering scope; mitigate via phased build (see Implementation Plan)
- **Gimmick risk**: an elaborate IDE metaphor with thin content reads worse than a plain page with strong content — content quality must not be sacrificed for UI novelty
- **Accessibility/usability for non-technical visitors**: mitigate with a clearly visible "plain view" affordance if the simulation ever confuses a first-time visitor (optional stretch goal, not v1-blocking)
