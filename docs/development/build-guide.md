# Build Guide — PortfolioOS

The complete path from zero to deployed, phase by phase, with ready-to-paste prompts for Claude Code or Codex. Attach the relevant docs to each prompt as noted. Run each prompt, review the output, test it locally, commit, *then* move to the next prompt. Never skip ahead or bundle phases — that's how you end up with code you can't explain in an interview.

**Attach to every prompt in this guide:** `TRD.md` (stack + architecture) as baseline context. Additional docs are noted per prompt.

---

## PHASE 1 — Backend Foundation

### Prompt 1.1 — Project scaffold + models
> Attach: `TRD.md`, `database-schema.md`, `project-structure.md`
>
> "Follow the exact folder structure in the attached project-structure.md for the `backend/` directory. Scaffold a FastAPI project with `app/models/`, `app/schemas/`, `app/routers/public/`, `app/routers/admin/`, `app/services/`, `app/core/` (config, database, security). Set up SQLAlchemy with a PostgreSQL connection using environment variables (`DATABASE_URL`). Create SQLAlchemy models for `sections`, `projects`, `skills`, `messages`, `guestbook_entries`, `analytics_events`, and `admin_user` — one file per model per the structure doc — matching the schema in the attached database-schema.md exactly, including the self-referencing `parent_id` on `sections`. Set up Alembic and generate the initial migration. Don't build any API routes yet — just the project structure, models, and migration."

### Prompt 1.2 — Public read endpoints
> Attach: `api-reference.md`
>
> "Now build the public GET endpoints from the attached api-reference.md: `GET /api/sections` (return the full tree, nested children under folders), `GET /api/sections/{slug}`, `GET /api/projects`, `GET /api/skills` (grouped by category). Use Pydantic response schemas matching the example JSON shapes in the doc. Add basic error handling for 404s."

### Prompt 1.3 — Public write endpoints
> Attach: `api-reference.md`
>
> "Build the public POST endpoints: `POST /api/contact`, `POST /api/guestbook`, `POST /api/analytics/event`, matching the request bodies in api-reference.md. Validate inputs with Pydantic. Add basic rate limiting (slowapi or similar) to `/contact` and `/guestbook` to prevent spam. Guestbook entries should default to `is_approved: false`."

### Prompt 1.4 — Seed script
> Attach: `seed-content.md`
>
> "Write a seed script that populates the database with the content in the attached seed-content.md — the bio, education, README sections, all 4 projects with their tech stacks and highlights, and the full skills list grouped by category. Structure the sidebar sections to match the tree in user-flow.md's site map (Home, About Me folder with Bio/Education children, Projects, Skills, README, Files folder, Contact)."

### Prompt 1.5 — Tests
> "Write Pytest tests covering the models and the endpoints built so far — at minimum: sections tree returns correctly nested, projects list returns all seeded projects, contact form rejects invalid input and accepts valid input, guestbook entries default to unapproved."

**Checkpoint before Phase 2:** run the server locally, hit each endpoint, confirm seeded content comes back correctly, all tests pass.

---

## PHASE 2 — Frontend Shell

### Prompt 2.1 — Static layout
> Attach: `UIUX-spec.md`, `project-structure.md`
>
> "Follow the exact folder structure in the attached project-structure.md for the `frontend/` directory — CSS split into base/themes/layout/components/responsive, JS split into core/components/features, admin fully separate. Build the static HTML/CSS layout for a VS Code-style UI, per the attached UIUX-spec.md §2 (desktop layout) and §3 (responsiveness): title bar, sidebar, tab bar, content pane, terminal panel (collapsed by default), status bar. No dynamic data yet — just the structural shell with placeholder content, fully responsive per the breakpoints in §3."

### Prompt 2.2 — Sidebar + tabs + content rendering
> Attach: `api-reference.md`, `user-flow.md`
>
> "Wire the sidebar to fetch `GET /api/sections` and render the tree (folders expand/collapse, files are clickable). Clicking a file opens it as a tab in the tab bar (support multiple open tabs, closable, active tab highlighted) and renders its content in the content pane — markdown sections render as formatted text, the Projects section renders each project as a card with tech stack tags, links, and highlights, fetched from `GET /api/projects`."

### Prompt 2.3 — Theme system (13 themes)
> Attach: `UIUX-spec.md`
>
> "Implement the theme system per UIUX-spec.md §5 and §6: CSS custom properties for background, foreground, sidebar background, accent color, and syntax colors. Build all 10 base themes (Dark+, Dracula, One Dark Pro, Monokai, Nord, Solarized Dark, Night Owl, Light+, Solarized Light, GitHub Light) plus the 3 special themes (Project Hail Mary, Interstellar, F1) with their specific palettes described in §6. Build a command-palette overlay (Ctrl+Shift+P style) for theme switching. Persist the selected theme in localStorage and apply it via a `data-theme` attribute on `<html>`."

### Prompt 2.4 — Pet companions + custom cursors
> Attach: `UIUX-spec.md`
>
> "Add the pet companion system from UIUX-spec.md §6: a single CSS/SVG sprite that paces left-right along the bottom of the screen, matching whichever special theme is active (Rocky & Grace for Project Hail Mary, a rocket for Interstellar, an F1 car for F1). No pet shows for base themes. Add one click-triggered reaction animation per pet (bounce, thrust-flare, boost respectively). Also implement the custom per-theme cursors (pixel-dot for Hail Mary, glowing dot with trailing particle for Interstellar, crosshair for F1); base themes keep the default cursor."

### Prompt 2.5 — Terminal panel
> Attach: `UIUX-spec.md`, `api-reference.md`
>
> "Build the terminal panel per UIUX-spec.md §7: toggleable, parses the fixed command set (help, whoami, about, education, skills, projects, resume, contact, socials, theme <name>, clear, sudo hire-me). `theme <name>` should actually switch the active theme. Every command execution should POST to `/api/analytics/event` with `event_type: 'command'`. Also fire a `page_view` event on initial load."

### Prompt 2.6 — Full responsiveness
> Attach: `UIUX-spec.md`
>
> "Implement the full responsiveness spec from UIUX-spec.md §3: real breakpoints at 600px and 1024px (not just a single mobile cutoff), per-component adaptive behavior for sidebar/tabs/terminal/pet/cursor/command palette exactly as described, `visualViewport`-based keyboard handling so the terminal input stays visible above the on-screen keyboard on mobile, 44×44px minimum touch targets on every interactive element, `(hover: none)` media query to skip custom cursor themes on touch devices, and `prefers-reduced-motion` support disabling pet/cursor animations. Test at 360px, 600px, 1024px, and desktop widths."

### Prompt 2.7 — Keyboard shortcuts
> Attach: `UIUX-spec.md`
>
> "Implement the keyboard shortcut system from UIUX-spec.md §8: a single global shortcut registry (not scattered per-component listeners) covering command palette, terminal toggle, sidebar toggle, quick-open fuzzy search, tab close/cycle, and arrow-key sidebar navigation. Shortcuts must not fire while any input/textarea has focus, except Esc. Add a 'Keyboard Shortcuts' reference view accessible from the command palette listing all of them. Desktop/tablet only — no-op on touch devices."

### Prompt 2.8 — Mobile responsive pass
> "Do a full mobile QA pass against UIUX-spec.md §3: sidebar becomes a hamburger-triggered drawer, tabs collapse to a current-section dropdown, terminal becomes a full-screen overlay with a persistent close button. Test at 360px, 600px, and 1024px breakpoints specifically, not just 'mobile vs desktop.'"

**Checkpoint before Phase 3:** the site should now be fully browsable and interactive with real seeded content, no admin functionality yet.

---

## PHASE 3 — Auth + Admin CMS

### Prompt 3.1 — Auth
> Attach: `api-reference.md`, `database-schema.md`
>
> "Implement JWT auth: `POST /api/auth/login` checking against the `admin_user` table (bcrypt-hashed password), returning a short-lived access token. Add a FastAPI dependency that validates the JWT and protects all `/api/admin/*` routes, returning 401 if missing/invalid. Write a one-off script to create the initial admin user with a hashed password from an env var — don't hardcode credentials."

### Prompt 3.2 — Admin CRUD endpoints
> Attach: `api-reference.md`
>
> "Build the protected admin endpoints from api-reference.md: full CRUD for `/api/admin/sections` (including creating brand-new sidebar entries with parent/slug/icon/content), `/api/admin/projects`, `/api/admin/skills`, plus `GET/PATCH` for `/api/admin/messages` and `/api/admin/guestbook`, and `GET /api/admin/analytics/summary` (page views over time, top terminal commands by count)."

### Prompt 3.3 — Admin UI
> Attach: `UIUX-spec.md`
>
> "Build the `/admin` frontend per UIUX-spec.md's Admin panel component notes — a separate, plain dashboard layout (not VS Code-styled): a login screen, then a dashboard with tabs/sections for Messages (inbox, mark as read), Guestbook (approve/reject pending entries), Analytics (simple charts for page views and top commands), and a Content Editor. The Content Editor needs: a list/edit view for existing sections/projects/skills, and a 'create new section' form (title, slug, icon, parent folder, content) that adds a brand-new entry to the live sidebar without any code change."

### Prompt 3.4 — Admin tests
> "Write Pytest tests for the admin auth flow (login success/failure) and confirm admin routes reject requests without a valid JWT, and that creating a new section via the admin API makes it appear in the public `GET /api/sections` response."

**Checkpoint before Phase 4:** log into `/admin`, edit an existing section's content, create a brand-new section, confirm it appears live on the public site with no redeploy.

---

## PHASE 4 — Polish + Deploy

### Prompt 4.1 — Resume
> "Add a resume feature: a `GET /api/resume` endpoint serving a PDF for download, plus an inline-viewable resume page in the Files section rendering the same content as formatted HTML/markdown."

### Prompt 4.2 — Metadata + favicon
> "Add favicon, page title, meta description, and Open Graph tags (title, description, image) so link previews look good when this URL is shared."

### Prompt 4.3 — CI/CD
> "Set up a GitHub Actions workflow that runs lint (ruff or flake8) and Pytest on every push to main. Add a status badge to the README and reference it in the site's status bar per TRD.md §1 and §9."

### Prompt 4.4 — Deploy
> Attach: `TRD.md`
>
> "Prepare this project for deployment to Render per TRD.md §9: a `render.yaml` or manual service config for the FastAPI backend, environment variable setup (DATABASE_URL, JWT secret, admin credentials), Alembic migration running on deploy, and the frontend served via FastAPI's StaticFiles mount. Write a brief DEPLOY.md with the exact steps to go from this repo to a live Render URL."

**Final checkpoint:** production URL loads, all sections navigate correctly, terminal works, all 13 themes + pets + cursors work, contact form and guestbook submit successfully, admin panel is reachable only with valid login, CI badge is green.

---

## Full Story / Path Summary

1. **Plan** (done): PRD → TRD → UI/UX Spec → User Flow → Implementation Plan → API Reference → Database Schema → Seed Content → this Build Guide
2. **Phase 1** (2–3 days): backend exists, serves real seeded data, no UI yet
3. **Phase 2** (2–3 days): full VS Code UI, themes, pets, cursors, terminal — browsable and fun, still no admin
4. **Phase 3** (3–4 days): the CMS — the part that makes this a genuine engineering project, not a static site with a costume on
5. **Phase 4** (1–2 days): the boring-but-critical part — resume, metadata, CI, actual deployment
6. **Ship**: live URL, public repo, CI badge, ready to put on a resume and LinkedIn

Total: ~11–13 working days at the pace laid out in `implementation-plan.md`, assuming AI-assisted development at the phase granularity above.
