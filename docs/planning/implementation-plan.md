# Implementation Plan — PortfolioOS

Target: 1–2 weeks, solo build with AI coding assistance (Claude Code / Codex). Work phase by phase — don't prompt for the whole app at once.

## Phase 1 — Backend Foundation (Days 1–3)
- [ ] Scaffold FastAPI project structure (`app/`, `models/`, `schemas/`, `routers/`, `core/`)
- [ ] Set up PostgreSQL connection + SQLAlchemy engine/session
- [ ] Define models: `sections`, `projects`, `skills`, `messages`, `guestbook_entries`, `analytics_events`, `admin_user`
- [ ] Set up Alembic, generate initial migration
- [ ] Build public read endpoints: `/api/sections`, `/api/sections/{slug}`, `/api/projects`, `/api/skills`
- [ ] Build public write endpoints: `/api/contact`, `/api/guestbook`, `/api/analytics/event`
- [ ] Write seed script with real content: bio, education, 4 featured projects, skills
- [ ] Basic Pytest coverage for models + endpoints

## Phase 2 — Frontend Shell (Days 4–6)
- [ ] Build static layout: title bar, sidebar, tab bar, content pane, status bar
- [ ] Fetch and render sidebar tree from `/api/sections`
- [ ] Implement tab open/close/switch logic
- [ ] Implement content pane rendering (markdown for text sections, cards for projects)
- [ ] Build theme system: CSS custom properties, 10 base theme definitions, command palette or status-bar switcher, `localStorage` persistence
- [ ] Build 3 special easter-egg themes: Project Hail Mary, Interstellar, F1 (see UIUX-spec §6 for palette/cursor/pet spec per theme)
- [ ] Build pet companion system: single active sprite matching current theme, left-right pacing animation, one click-triggered reaction animation per pet (Rocky/Grace bounce, rocket thrust-flare, F1 car boost) — keep to CSS/SVG, no animation library needed
- [ ] Build per-theme custom cursors (crosshair, glowing dot, pixel-dot) for the 3 special themes; default cursor for base themes
- [ ] Build terminal panel: input parsing, fixed command set, output rendering
- [ ] Wire terminal commands to real data/endpoints where relevant (`projects`, `resume`, `contact`, `theme`)
- [ ] Mobile responsive pass (sidebar drawer, terminal overlay)
- [ ] Full responsiveness implementation per UIUX-spec §3: real breakpoints (mobile <600px, tablet 600-1024px, desktop >1024px), per-component adaptive behavior, `visualViewport`-based mobile keyboard handling for the terminal, 44px+ touch targets, `(hover: none)` detection to skip custom cursors on touch, `prefers-reduced-motion` support
- [ ] Global keyboard shortcut system per UIUX-spec §8: command palette, terminal toggle, sidebar toggle, quick-open, tab close/cycle, sidebar arrow-key navigation — implemented as a single shortcut registry, disabled while inputs are focused (except Esc), desktop/tablet only

## Phase 3 — Auth + Admin CMS (Days 7–10)
- [ ] Implement JWT auth (`/api/auth/login`), password hashing for `admin_user`
- [ ] Protect admin routes with auth dependency
- [ ] Build admin dashboard UI (separate from VS Code shell — simple standard layout)
- [ ] Messages inbox view (read/mark-as-read)
- [ ] Guestbook moderation view (approve/reject)
- [ ] Analytics view (page views, top commands — simple charts)
- [ ] Content editor: edit existing section content
- [ ] Content creator: add new sidebar section / project / skill entries dynamically

## Phase 4 — Polish + Deploy (Days 11–13)
- [ ] Resume: PDF download endpoint + inline-viewable resume page
- [ ] Favicon, meta tags, OG image for link previews
- [ ] Full mobile QA pass
- [ ] Set up GitHub Actions CI (lint + Pytest), add status badge to README and site status bar
- [ ] Make GitHub repo public, link from site
- [ ] Deploy backend + Postgres to Render, configure env vars
- [ ] Deploy/serve frontend (via FastAPI static mount or separate Render static site)
- [ ] Final smoke test on production URL

## Explicit Non-Goals for v1 (see PRD §4)
Do not build blog/CMS-for-articles, multi-user accounts, native mobile app, or payments in this pass — flag and defer if AI tooling suggests adding them.

## Working With AI Tools — Suggested Prompt Sequence
1. "Here's my PRD, TRD, and Implementation Plan [attach]. Let's do Phase 1, task by task, starting with the FastAPI project scaffold and SQLAlchemy models only."
2. Review, run locally, commit.
3. "Now the public read endpoints for sections/projects/skills, matching the API Reference doc [attach]."
4. Continue task-by-task through each phase — one prompt per checklist item or small cluster of related items, not per phase.
