# Seed Content — PortfolioOS

Real content to load into the database via the Phase 1 seed script. Written to match the tone of a working backend developer, not a generic template. Edit freely before seeding — this is a strong first draft, not final copy.

---

## Bio (`sections` — slug: `bio`)

> I'm Mohamed Ibrahim Y, a backend developer and final-year Computer Science Engineering student based in Chennai, India. I build and ship real, working software — REST APIs with JWT auth and rate limiting, CI/CD pipelines that actually run, and full-stack Flask applications that go from local machine to a live URL on Render or Railway.
>
> Outside of coursework, I split my time between software development, teaching, and freelance client work — which means I've had to get good at shipping things that work under real constraints, not just in a tutorial. This portfolio itself is one of those: it's not a static template, it's a FastAPI + PostgreSQL service with its own admin panel, because I'd rather build the thing than fake it.

## Education (`sections` — slug: `education`)

> **B.E. Computer Science Engineering**
> Dhaanish Ahmed College of Engineering — 2022–2026
> CGPA: 8.01 / 10

## README (`sections` — slug: `readme`, GitHub-style intro)

> ## portfolio-os
>
> A developer portfolio that pretends to be VS Code — sidebar file tree, tabs, a working terminal, 13 switchable themes — backed by a real FastAPI + PostgreSQL API with a private CMS admin panel.
>
> **Why build it this way?** Because a portfolio *about* backend engineering should probably have some backend engineering in it. Every piece of content here — projects, skills, even this README — is a row in a database, editable through an admin panel, not hardcoded HTML.
>
> **Stack:** FastAPI · SQLAlchemy · PostgreSQL · vanilla JS · deployed on Render
>
> Check the sidebar. Try the terminal. Type `help`.

---

## Projects (`projects` table)

### 1. Job Tracker API
**Description:**
> A production-ready 12-endpoint REST API for tracking the full job application lifecycle — Applied → Interview → Offer/Rejected — with complete status-history logging via a normalized relational schema. Built with strict per-user data isolation in mind from day one.

**Tech stack:** `Flask`, `PostgreSQL`, `JWT (access/refresh)`, `Flask-Caching`, `Flask-Limiter`, `APScheduler`, `Pytest`, `GitHub Actions`

**Highlights:**
- JWT access/refresh authentication with strict per-user data isolation
- Response caching and rate limiting built in from the start
- Automated background jobs via APScheduler
- Full Pytest suite wired into GitHub Actions CI/CD

---

### 2. Money Tracker (Expense & Income Tracking App)
**Description:**
> A full-stack personal finance web app for tracking expenses and income, with an interactive dashboard that gives instant income/expense/net-balance summaries. Built with a normalized schema and strict multi-user data isolation, so every user's financial data stays properly separated and secure.

**Tech stack:** `Flask`, `SQLite`, `HTML/CSS`, `Session-based auth`

**Highlights:**
- Normalized relational schema for users, categories, and transactions
- Secure CRUD with strict multi-user data isolation
- Optimized queries powering real-time financial summaries
- Server-side validation and error handling throughout

---

### 3. Curated by Afza — Handmade Gifts E-Commerce
**Description:**
> A full Flask e-commerce platform built for a handmade gifts business, from initial build through a rigorous multi-audit technical review. Took the codebase through a 59-task, 14-phase remediation roadmap covering security hardening, a Cloudinary-backed media pipeline, and a full architectural cleanup.

**Tech stack:** `Flask`, `Cloudinary`, `CSS/JS modular refactor`

**Highlights:**
- Refactored a monolithic stylesheet into 5 modular files and a monolithic JS file into 4 decoupled modules with a reusable cropper API
- Ran a full security and reliability audit, identifying and roadmapping fixes including an account-takeover path in the password reset flow
- Delivered brand identity work — logo iterations, social presence, print-ready business card assets
- Wrote a beginner-level full-codebase PDF study guide documenting the entire system

---

### 4. Awaken Your Inner Power — Life Coaching Platform
**Description:**
> A complete Flask website built from scratch for a life-coaching business, live at awakenyourinnerpower.co.in. Owns and maintains the site end-to-end — from the booking system to the brand identity.

**Tech stack:** `Flask`, `FullCalendar.js`, `CallMeBot WhatsApp API`, `Admin dashboard`

**Highlights:**
- FullCalendar.js-powered booking system with WhatsApp notifications via CallMeBot
- Full custom admin dashboard for site management
- Complete brand system built around a lotus logo motif
- Professional README and MIT license — packaged like a real open-source-quality repo

---

## Skills (`skills` table, grouped by category)

**Backend**
Python, Flask, FastAPI, SQLAlchemy, REST API design, JWT authentication, rate limiting, background jobs (APScheduler)

**Database**
PostgreSQL, SQLite, schema design & normalization

**DevOps / Deployment**
GitHub Actions (CI/CD), Render, Railway, Git version control

**Frontend**
HTML, CSS, JavaScript, responsive design

**Testing**
Pytest, API testing

**Other**
Technical documentation, code audits & remediation planning, third-party API integration (Cloudinary, WhatsApp/CallMeBot)

---

## Contact (`sections` — slug: `contact`)
> Fill in with your real email, GitHub, LinkedIn, and any other social links before seeding — kept blank here intentionally since these weren't specified.
