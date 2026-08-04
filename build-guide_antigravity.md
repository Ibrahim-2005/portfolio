# Build Guide — PortfolioOS (Antigravity Edition)

The complete path from zero to deployed, phase by phase, with ready-to-paste prompts formatted for **Google Antigravity's `@`-mention syntax**. Run each prompt, review the output, test it locally, commit per `GIT-WORKFLOW.md`, *then* move to the next prompt. Never skip ahead or bundle phases — that's how you end up with code you can't explain in an interview.

## Setup — Do This Once, Before Prompt 1.1
1. Create a `portfolio-os/` folder and copy all 11 planning docs into its root (PRD.md, TRD.md, UIUX-spec.md, user-flow.md, implementation-plan.md, api-reference.md, database-schema.md, seed-content.md, project-structure.md, build-guide.md, GIT-WORKFLOW.md).
2. `git init` inside it, then make your first commit per `GIT-WORKFLOW.md` §4 (`chore: initial commit — project structure, docs, .gitignore`).
3. In Antigravity: **File → Open Folder** and select `portfolio-os/`. Don't start prompting from a blank "New Conversation" outside a project — `@` mentions only resolve to files that exist inside an opened folder.
4. Start every new conversation *from inside* the opened `portfolio-os` project.

## How to Use `@` Mentions Correctly
Every prompt below has doc names written as `@filename.md`. When you type `@` in Antigravity's input box, it should show an autocomplete dropdown — **click the actual file from that dropdown** so it becomes a real reference chip. If you just type the filename as plain text without selecting it from the dropdown, the agent will treat it as a word, not an attached file, and won't reliably read its actual content. If `@` shows no matches, the file isn't in your opened folder yet — go back to Setup step 1.

## Model Selection Per Prompt
Default to **Claude Sonnet 4.6 (Thinking)** for almost everything below — it's the right cost/capability balance for scaffolding, CRUD, and UI work. Switch to **Claude Opus 4.6 (Thinking)** only for the prompts marked **[Opus recommended]** — genuinely harder reasoning (auth/security logic, the CMS content model, the analytics aggregation). Don't run routine prompts on Opus; it burns your free-tier quota faster for no real benefit on simple tasks.

## Agent Mode
Make sure the agent mode selector (top-right of the input box, labeled "Main Agent" in your setup) is set to the mode with **file write access**, not a read-only chat mode — you need it to actually create files, not just describe what it would do.

---

## PHASE 1 — Backend Foundation

### Prompt 1.1 — Project scaffold + models
> Follow the exact folder structure in @project-structure.md for the `backend/` directory. Scaffold a FastAPI project with `app/models/`, `app/schemas/`, `app/routers/public/`, `app/routers/admin/`, `app/services/`, `app/core/` (config, database, security). Set up SQLAlchemy with a PostgreSQL connection using environment variables (`DATABASE_URL`). Create SQLAlchemy models for `sections`, `projects`, `skills`, `messages`, `guestbook_entries`, `analytics_events`, and `admin_user` — one file per model per the structure doc — matching the schema in @database-schema.md exactly, including the self-referencing `parent_id` on `sections`. Set up Alembic and generate the initial migration. Don't build any API routes yet — just the project structure, models, and migration.

### Prompt 1.2 — Public read endpoints
> Build the public GET endpoints from @api-reference.md: `GET /api/sections` (return the full tree, nested children under folders), `GET /api/sections/{slug}`, `GET /api/projects`, `GET /api/skills` (grouped by category). Use Pydantic response schemas matching the example JSON shapes in the doc. Add basic error handling for 404s.

### Prompt 1.3 — Public write endpoints
> Build the public POST endpoints: `POST /api/contact`, `POST /api/guestbook`, `POST /api/analytics/event`, matching the request bodies in @api-reference.md. Validate inputs with Pydantic. Add basic rate limiting (slowapi or similar) to `/contact` and `/guestbook` to prevent spam. Guestbook entries should default to `is_approved: false`.

### Prompt 1.4 — Seed script
> Write a seed script that populates the database with the content in @seed-content.md — the bio, education, README sections, all 4 projects with their tech stacks and highlights, and the full skills list grouped by category. Structure the sidebar sections to match the tree in @user-flow.md's site map (Home, About Me folder with Bio/Education children, Projects, Skills, README, Files folder, Contact).

### Prompt 1.5 — Tests
> Write Pytest tests covering the models and the endpoints built so far — at minimum: sections tree returns correctly nested, projects list returns all seeded projects, contact form rejects invalid input and accepts valid input, guestbook entries default to unapproved.

**Checkpoint before Phase 2:** run the server locally, hit each endpoint, confirm seeded content comes back correctly, all tests pass. Commit per `GIT-WORKFLOW.md` (should be 4-6 commits for this phase, not one).

---

## PHASE 2 — Frontend Shell

### Prompt 2.1 — Static layout
> Follow the exact folder structure in @project-structure.md for the `frontend/` directory — CSS split into base/themes/layout/components/responsive, JS split into core/components/features, admin fully separate. Build the static HTML/CSS layout for a VS Code-style UI, per @UIUX-spec.md §2 (desktop layout) and §3 (responsiveness): title bar, sidebar, tab bar, content pane, terminal panel (collapsed by default), status bar. No dynamic data yet — just the structural shell with placeholder content, fully responsive per the breakpoints in §3.

### Prompt 2.1b — Home hero content
> The VS Code shell (sidebar, tabs, status bar) is already built and correct — don't touch that. This is a focused addition: update only the Home tab's content pane per @UIUX-spec.md §2.1 (Home Content Design). Replace the current placeholder "Home" heading with: a small muted monospace comment-style line, a large bold name, a tagline, a row of role badges (pill-shaped, theme-accent colored), a short intro sentence, three CTA buttons (Projects/About Me/Contact) that jump to those sidebar sections, and a stats row with 4 blocks. Use these exact values: name "Mohamed Ibrahim Y", tagline "Building real, working software 🚀", badges "Backend Developer · Full-Stack · Freelancer & Educator · Final-Year CSE", stats "4+ Projects Shipped", "13 Themes", "100% Backend Tests Passing", "∞ Curiosity". Every other tab (About Me, Projects, Skills, README, Files, Contact) keeps its plain content-pane rendering as-is — this styling is specific to Home only.

### Prompt 2.2 — Sidebar + tabs + content rendering
> Wire the sidebar to fetch `GET /api/sections` and render the tree (folders expand/collapse, files are clickable). Clicking a file opens it as a tab in the tab bar (support multiple open tabs, closable, active tab highlighted) and renders its content in the content pane — markdown sections render as formatted text, the Projects section renders each project as a card with tech stack tags, links, and highlights, fetched from `GET /api/projects`. Reference @api-reference.md and @user-flow.md for the exact shapes and flow.

### Prompt 2.3 — Theme system (13 themes)
> Implement the theme system per @UIUX-spec.md §5 and §6: CSS custom properties for background, foreground, sidebar background, accent color, and syntax colors. Build all 10 base themes (Dark+, Dracula, One Dark Pro, Monokai, Nord, Solarized Dark, Night Owl, Light+, Solarized Light, GitHub Light) plus the 3 special themes (Project Hail Mary, Interstellar, F1) with their specific palettes described in §6. Build a command-palette overlay (Ctrl+Shift+P style) for theme switching. Persist the selected theme in localStorage and apply it via a `data-theme` attribute on `<html>`.

### Prompt 2.4 — Pet companions + custom cursors
> Add the pet companion system from @UIUX-spec.md §6: a single CSS/SVG sprite that paces left-right along the bottom of the screen, matching whichever special theme is active (Rocky & Grace for Project Hail Mary, a rocket for Interstellar, an F1 car for F1). No pet shows for base themes. Add one click-triggered reaction animation per pet (bounce, thrust-flare, boost respectively). Also implement the custom per-theme cursors (pixel-dot for Hail Mary, glowing dot with trailing particle for Interstellar, crosshair for F1); base themes keep the default cursor.

### Prompt 2.5 — Terminal panel
> Build the terminal panel per @UIUX-spec.md §7: toggleable, parses the fixed command set (help, whoami, about, education, skills, projects, resume, contact, socials, theme <name>, clear, sudo hire-me). `theme <name>` should actually switch the active theme. Every command execution should POST to `/api/analytics/event` (see @api-reference.md) with `event_type: 'command'`. Also fire a `page_view` event on initial load.

### Prompt 2.6 — Full responsiveness
> Implement the full responsiveness spec from @UIUX-spec.md §3: real breakpoints at 600px and 1024px (not just a single mobile cutoff), per-component adaptive behavior for sidebar/tabs/terminal/pet/cursor/command palette exactly as described, `visualViewport`-based keyboard handling so the terminal input stays visible above the on-screen keyboard on mobile, 44×44px minimum touch targets on every interactive element, `(hover: none)` media query to skip custom cursor themes on touch devices, and `prefers-reduced-motion` support disabling pet/cursor animations. Test at 360px, 600px, 1024px, and desktop widths.
>
> **Antigravity tip:** this is the ideal prompt to let the Browser Subagent verify — after it builds, ask it to open the local dev server, resize the viewport through each breakpoint, and screenshot the result so you can visually confirm before moving on.

### Prompt 2.7 — Keyboard shortcuts
> Implement the keyboard shortcut system from @UIUX-spec.md §8: a single global shortcut registry (not scattered per-component listeners) covering command palette, terminal toggle, sidebar toggle, quick-open fuzzy search, tab close/cycle, and arrow-key sidebar navigation. Shortcuts must not fire while any input/textarea has focus, except Esc. Add a 'Keyboard Shortcuts' reference view accessible from the command palette listing all of them. Desktop/tablet only — no-op on touch devices.

### Prompt 2.8 — Mobile responsive pass
> Do a full mobile QA pass against @UIUX-spec.md §3: sidebar becomes a hamburger-triggered drawer, tabs collapse to a current-section dropdown, terminal becomes a full-screen overlay with a persistent close button. Test at 360px, 600px, and 1024px breakpoints specifically, not just "mobile vs desktop." Use the Browser Subagent to screenshot each breakpoint if available.

**Checkpoint before Phase 3:** the site should now be fully browsable and interactive with real seeded content, no admin functionality yet. Commit per `GIT-WORKFLOW.md`.

---

## PHASE 3 — Auth + Admin CMS

### Prompt 3.1 — Auth **[Opus recommended]**
> Implement JWT auth: `POST /api/auth/login` checking against the `admin_user` table (bcrypt-hashed password), returning a short-lived access token. Add a FastAPI dependency that validates the JWT and protects all `/api/admin/*` routes, returning 401 if missing/invalid. Reference @api-reference.md and @database-schema.md. Write a one-off script to create the initial admin user with a hashed password from an env var — don't hardcode credentials.

### Prompt 3.2 — Admin CRUD endpoints **[Opus recommended]**
> Build the protected admin endpoints from @api-reference.md: full CRUD for `/api/admin/sections` (including creating brand-new sidebar entries with parent/slug/icon/content), `/api/admin/projects`, `/api/admin/skills`, plus `GET/PATCH` for `/api/admin/messages` and `/api/admin/guestbook`, and `GET /api/admin/analytics/summary` (page views over time, top terminal commands by count).

### Prompt 3.3 — Admin UI
> Build the `/admin` frontend per @UIUX-spec.md's Admin panel component notes and @project-structure.md's `frontend/admin/` layout — a separate, plain dashboard (not VS Code-styled): a login screen, then a dashboard with tabs/sections for Messages (inbox, mark as read), Guestbook (approve/reject pending entries), Analytics (simple charts for page views and top commands), and a Content Editor. The Content Editor needs: a list/edit view for existing sections/projects/skills, and a "create new section" form (title, slug, icon, parent folder, content) that adds a brand-new entry to the live sidebar without any code change.

### Prompt 3.4 — Admin tests
> Write Pytest tests for the admin auth flow (login success/failure) and confirm admin routes reject requests without a valid JWT, and that creating a new section via the admin API makes it appear in the public `GET /api/sections` response.

**Checkpoint before Phase 4:** log into `/admin`, edit an existing section's content, create a brand-new section, confirm it appears live on the public site with no redeploy. Commit per `GIT-WORKFLOW.md`.

---

## PHASE 4 — Polish + Deploy

### Prompt 4.1 — Resume
> Add a resume feature: a `GET /api/resume` endpoint serving a PDF for download, plus an inline-viewable resume page in the Files section rendering the same content as formatted HTML/markdown.

### Prompt 4.2 — Metadata + favicon
> Add favicon, page title, meta description, and Open Graph tags (title, description, image) so link previews look good when this URL is shared.

### Prompt 4.3 — CI/CD
> Set up a GitHub Actions workflow that runs lint (ruff or flake8) and Pytest on every push to main. Add a status badge to the README and reference it in the site's status bar per @TRD.md §1 and §9.

### Prompt 4.4 — Deploy **[Opus recommended]**
> Prepare this project for deployment to Render per @TRD.md §9: a `render.yaml` or manual service config for the FastAPI backend, environment variable setup (DATABASE_URL, JWT secret, admin credentials), Alembic migration running on deploy, and the frontend served via FastAPI's StaticFiles mount. Write a brief DEPLOY.md with the exact steps to go from this repo to a live Render URL.

**Final checkpoint:** production URL loads, all sections navigate correctly, terminal works, all 13 themes + pets + cursors work, contact form and guestbook submit successfully, admin panel is reachable only with valid login, CI badge is green. Tag the release per `GIT-WORKFLOW.md` §6 (`git tag v1.0`).

---

## Full Story / Path Summary

1. **Plan** (done): PRD → TRD → UI/UX Spec → User Flow → Implementation Plan → API Reference → Database Schema → Seed Content → Project Structure → Git Workflow → this Build Guide
2. **Phase 1** (2–3 days): backend exists, serves real seeded data, no UI yet
3. **Phase 2** (2–3 days): full VS Code UI, themes, pets, cursors, terminal — browsable and fun, still no admin
4. **Phase 3** (3–4 days): the CMS — the part that makes this a genuine engineering project, not a static site with a costume on
5. **Phase 4** (1–2 days): the boring-but-critical part — resume, metadata, CI, actual deployment
6. **Ship**: live URL, public repo, CI badge, ready to put on a resume and LinkedIn

Total: ~11–13 working days at the pace laid out in `implementation-plan.md`, assuming AI-assisted development at the phase granularity above, in Google Antigravity with Claude Sonnet 4.6 as the default driver.
