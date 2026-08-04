# Project Structure — PortfolioOS

The complete folder layout, backend and frontend, organized so each concern lives in exactly one place — CSS split by use case, JS split by use case, admin fully separated from the public site. Hand this to Claude Code/Codex alongside the Phase 1/2 prompts so scaffolding follows this exactly instead of improvising.

---

## Full Tree

```
portfolio-os/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app entrypoint
│   │   ├── core/
│   │   │   ├── config.py              # env vars, settings
│   │   │   ├── database.py            # SQLAlchemy engine/session
│   │   │   └── security.py            # JWT, password hashing
│   │   ├── models/                    # one file per table
│   │   │   ├── section.py
│   │   │   ├── project.py
│   │   │   ├── skill.py
│   │   │   ├── message.py
│   │   │   ├── guestbook.py
│   │   │   ├── analytics.py
│   │   │   └── admin_user.py
│   │   ├── schemas/                   # Pydantic request/response models, mirrors models/
│   │   │   ├── section.py
│   │   │   ├── project.py
│   │   │   ├── skill.py
│   │   │   ├── message.py
│   │   │   ├── guestbook.py
│   │   │   ├── analytics.py
│   │   │   └── auth.py
│   │   ├── routers/
│   │   │   ├── public/                # unauthenticated routes
│   │   │   │   ├── sections.py
│   │   │   │   ├── projects.py
│   │   │   │   ├── skills.py
│   │   │   │   ├── contact.py
│   │   │   │   ├── guestbook.py
│   │   │   │   └── analytics.py
│   │   │   └── admin/                 # JWT-protected routes, fully separate
│   │   │       ├── auth.py
│   │   │       ├── sections.py
│   │   │       ├── projects.py
│   │   │       ├── skills.py
│   │   │       ├── messages.py
│   │   │       ├── guestbook.py
│   │   │       └── analytics.py
│   │   ├── services/                  # business logic, kept out of route handlers
│   │   │   ├── section_service.py
│   │   │   ├── analytics_service.py
│   │   │   └── auth_service.py
│   │   └── seed/
│   │       ├── seed.py                # entrypoint script
│   │       └── seed_content.py        # content constants, sourced from seed-content.md
│   ├── alembic/
│   │   └── versions/
│   ├── tests/
│   │   ├── test_sections.py
│   │   ├── test_projects.py
│   │   ├── test_contact.py
│   │   ├── test_guestbook.py
│   │   └── test_admin_auth.py
│   ├── .env.example
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   ├── index.html                     # public site entry
│   │
│   ├── css/
│   │   ├── base/                      # foundational, theme-agnostic
│   │   │   ├── reset.css
│   │   │   ├── variables.css          # CSS custom property *names* (values come from themes/)
│   │   │   └── typography.css
│   │   ├── themes/                    # one file per theme, defines variable *values* only
│   │   │   ├── dark-plus.css
│   │   │   ├── dracula.css
│   │   │   ├── one-dark-pro.css
│   │   │   ├── monokai.css
│   │   │   ├── nord.css
│   │   │   ├── solarized-dark.css
│   │   │   ├── night-owl.css
│   │   │   ├── light-plus.css
│   │   │   ├── solarized-light.css
│   │   │   ├── github-light.css
│   │   │   ├── project-hail-mary.css
│   │   │   ├── interstellar.css
│   │   │   └── f1.css
│   │   ├── layout/                    # structural chrome, one file per region
│   │   │   ├── titlebar.css
│   │   │   ├── sidebar.css
│   │   │   ├── tabs.css
│   │   │   ├── content-pane.css
│   │   │   └── statusbar.css
│   │   ├── components/                # reusable UI pieces, one file per component
│   │   │   ├── terminal.css
│   │   │   ├── command-palette.css
│   │   │   ├── project-card.css
│   │   │   ├── contact-form.css
│   │   │   ├── guestbook-form.css
│   │   │   ├── pet.css
│   │   │   └── cursor.css
│   │   └── responsive/                # breakpoint overrides only, per UIUX-spec §3
│   │       ├── tablet.css             # 600–1024px
│   │       └── mobile.css             # <600px
│   │
│   ├── js/
│   │   ├── main.js                    # entry point, wires everything together
│   │   ├── core/                      # app-wide infrastructure, no UI
│   │   │   ├── api.js                 # fetch wrapper for all /api calls
│   │   │   ├── state.js               # shared app state (open tabs, active theme, etc.)
│   │   │   └── router.js              # section/tab routing logic
│   │   ├── components/                # one file per UI component, matches css/components/
│   │   │   ├── sidebar.js
│   │   │   ├── tabs.js
│   │   │   ├── content-pane.js
│   │   │   ├── terminal.js
│   │   │   ├── command-palette.js
│   │   │   ├── status-bar.js
│   │   │   ├── project-card.js
│   │   │   └── contact-form.js
│   │   └── features/                  # self-contained feature modules
│   │       ├── theme-engine.js        # theme switching + localStorage persistence
│   │       ├── pet-companion.js       # pet sprite logic
│   │       ├── cursor-engine.js       # per-theme cursor logic, (hover:none) guard
│   │       ├── keyboard-shortcuts.js  # global shortcut registry, per UIUX-spec §8
│   │       └── analytics.js           # page_view/command event firing
│   │
│   ├── admin/                         # entirely separate mini-app, not VS Code-styled
│   │   ├── index.html                 # admin login + dashboard entry
│   │   ├── css/
│   │   │   ├── admin-layout.css
│   │   │   ├── admin-dashboard.css
│   │   │   └── admin-editor.css
│   │   └── js/
│   │       ├── admin-auth.js          # login, token storage
│   │       ├── admin-dashboard.js     # messages/guestbook/analytics views
│   │       └── admin-editor.js        # section/project/skill CRUD UI
│   │
│   └── assets/
│       ├── icons/
│       ├── pets/
│       │   ├── rocky-grace/
│       │   ├── rocket/
│       │   └── f1-car/
│       ├── cursors/
│       └── resume/
│           └── resume.pdf
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # lint + Pytest on push
│
├── PRD.md
├── TRD.md
├── UIUX-spec.md
├── user-flow.md
├── implementation-plan.md
├── api-reference.md
├── database-schema.md
├── seed-content.md
├── build-guide.md
├── project-structure.md               # this file
├── DEPLOY.md                          # written in Phase 4
└── README.md
```

---

## Organizing Principles

1. **One concern, one file.** Every CSS file styles exactly one region or component. Every JS file owns exactly one piece of behavior. If a file starts covering two things, split it — this is what made `main.js`/monolithic CSS painful to maintain on Curated by Afza, and this structure exists specifically to avoid repeating that.

2. **`themes/` defines values, `base/variables.css` defines names.** Theme files never contain layout or component CSS — only `--bg`, `--fg`, `--accent`, etc. values. This means adding theme #14 later is "add one file," not "touch ten files."

3. **`admin/` is a separate app, not a mode.** It has its own HTML entry, its own CSS, its own JS — it does not import from `frontend/css/` or `frontend/js/` (aside from `core/api.js`, which is fine to share since it's just a fetch wrapper). This keeps the VS Code simulation's styling from ever leaking into or constraining the admin dashboard, and vice versa.

4. **Backend mirrors this discipline**: `models/`, `schemas/`, and `routers/` all split one-file-per-table/resource, and `routers/public/` vs `routers/admin/` is a hard folder-level separation — matches the admin/public split on the frontend, and makes it obvious at a glance which routes need auth.

5. **`services/` keeps route handlers thin.** Route files should mostly parse the request, call a service function, and return the response — the actual logic (e.g. building the nested sections tree, aggregating analytics) lives in `services/` so it's testable independent of FastAPI.

---

## Build Guide Cross-Reference
Add this as the first line of **Prompt 1.1** in `build-guide.md`: *"Follow the exact folder structure in the attached project-structure.md."* Same for **Prompt 2.1** on the frontend side. This keeps the AI tool from inventing its own structure mid-build.
