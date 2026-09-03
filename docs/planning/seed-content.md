# Seed Content — PortfolioOS

| Attribute | Value |
| --- | --- |
| **Document Name** | Seed Content Specification |
| **Product Name** | PortfolioOS |
| **Document Version** | 1.0 (Official Release) |
| **Status** | Approved |
| **Release** | PortfolioOS v1.0 |
| **Last Updated** | September 2026 |
| **Target Repository** | [github.com/Ibrahim-2005/portfolio](https://github.com/Ibrahim-2005/portfolio) |

---

## 1. Document Purpose

This document defines the official seed content loaded into the PostgreSQL database during the initial seeding of PortfolioOS v1.0.

It reflects the real background, verified projects, demonstrated skills, education, contact channels, and system configuration of Mohamed Ibrahim Y. The content is structured to populate the respective relational tables and configuration singletons consumed by the FastAPI REST API and rendered across the PortfolioOS interface.

---

## 2. Home Page (`home_config`)

### Singleton Configuration

- **ID**: `1`
- **Top Comment**: `// main.py`
- **Headline Name**: `Mohamed Ibrahim Y`
- **Tagline**: `Building real, working software 🚀`
- **Intro Summary**: `I build and ship real software — REST APIs, CI/CD pipelines, and full-stack apps that go from my machine to a live URL.`

### Role Badges (`roles`)

- `Backend Developer`
- `Full-Stack`
- `Freelancer & Educator`
- `Final-Year CSE`

### Primary Navigation CTAs

- `Projects` &rarr; Navigates to `projects.sql`
- `About Me` &rarr; Navigates to `about.html`
- `Contact` &rarr; Navigates to `contact.jwt`

---

## 3. Biography & Profile (`about_config`)

### Singleton Configuration

- **ID**: `1`
- **Top Comment**: `// who I am · what I build · where I'm headed`
- **Heading**: `About Me`
- **Tagline**: `Backend Developer & Software Engineer`

### Biography Text (`about_me`)
>
> “Hi, I'm Mohamed Ibrahim Y — a software engineer focused on backend development and building practical software. I enjoy turning ideas into working systems, from REST APIs and database design to authentication, testing, and deployment.”

### Current Focus (`current_focus`)

- ⚙️ **Building reliable backend systems**
- 🚀 **Turning ideas into production software**
- 🧩 **Exploring system design & API architecture**

### Currently Learning (`currently_learning`)

- 🐍 **Python, FastAPI & Flask**
- 🗄️ **PostgreSQL & SQLAlchemy**
- 🔧 **APIs, Testing & CI/CD**

### Closing Callout

- **Title**: `ALWAYS BUILDING`
- **Text**: `I learn best by building — taking an idea, turning it into a working system, debugging what breaks, and shipping it. Currently focused on becoming a stronger software engineer with a deep foundation in backend development.`

---

## 4. Featured Projects (`projects` Table)

### 1. Job Tracker API

- **Sort Order**: `1`
- **Category**: Backend REST API
- **Repository**: [github.com/Ibrahim-2005/job-tracker-api](https://github.com/Ibrahim-2005/job-tracker-api)
- **Live URL**: `https://job-tracker-api-gjs9.onrender.com/`
- **Description**:
  > A production-oriented REST API for tracking the full job application lifecycle — Applied → Interview → Offer/Rejected — with complete status-history logging via a normalized relational schema. Built with strict per-user data isolation in mind from day one.
- **Tech Stack**:
  - `Flask` (Python 3.12 microframework)
  - `PostgreSQL` (Relational database hosted on Railway)
  - `Flask-JWT-Extended` (Access and refresh token authentication with token blocklist)
  - `Flask-Caching` (Dashboard response caching with manual cache-control headers)
  - `Flask-Limiter` (IP-based endpoint rate limiting)
  - `APScheduler` (Automated background jobs for stale application detection and cache eviction)
  - `Pytest` (Automated test suite covering auth, jobs, and dashboard metrics)
  - `GitHub Actions` (CI pipeline executing automated test workflows on push)
  - `Render` (API application deployment)
- **Key Highlights**:
  - JWT access and refresh token authentication with token blocklist logout and strict per-user data isolation.
  - Endpoints covering user registration, session management, job application CRUD, status transition history, and statistical aggregations.
  - Dashboard analytics calculating application counts, stage breakdown, and response rates with caching optimization (`X-Cache: HIT/MISS`).
  - Automated background scheduler identifying inactive job applications and triggering scheduled cache maintenance.
  - Automated Pytest test suite integrated into a GitHub Actions CI workflow.

---

### 2. Money Tracker (Expense & Income Tracking App)

- **Sort Order**: `2`
- **Category**: Full-Stack Web Application
- **Repository**: [github.com/Ibrahim-2005/Money_Tracker_UI](https://github.com/Ibrahim-2005/Money_Tracker_UI)
- **Live URL**: `https://money-tracker-zcps.onrender.com`
- **Description**:
  > A full-stack personal finance web application for tracking income and expenses, featuring an interactive dashboard that provides real-time income, expense, and net-balance summaries. Built with a normalized schema and strict multi-user data isolation so every user's financial records stay properly separated and secure.
- **Tech Stack**:
  - `Flask` (Application backend)
  - `SQLite` / `SQLAlchemy` (Normalized relational database management)
  - `HTML5` / `CSS3` (Custom responsive UI layout)
  - `Session-based auth` (Werkzeug password hashing and protected session state)
  - `Render` (Cloud deployment)
- **Key Highlights**:
  - Normalized relational database schema establishing foreign-key associations across users, custom categories, and financial transactions.
  - Full CRUD transaction lifecycle with categorized tracking and manual transaction date selection.
  - User-specific dashboard calculating total income, total expenditure, and live net balance.
  - Server-side input validation, error handling, and session authentication protecting all user routes.

---

### 3. Curated by Afza — Handmade Gifts E-Commerce

- **Sort Order**: `3`
- **Category**: Client E-Commerce Platform
- **Repository**: [github.com/Ibrahim-2005/Curated-by-afza](https://github.com/Ibrahim-2005/Curated-by-afza)
- **Live URL**: `https://curated-by-afza.onrender.com/`
- **Description**:
  > A full-stack Flask e-commerce platform built for a handmade gifting business, delivering complete product catalog browsing, customer testimonials, and an administrative management dashboard. Led the codebase through a structured 59-task, 14-phase architectural refactoring, frontend modularization, and security remediation pass.
- **Tech Stack**:
  - `Flask` (Application backend with Flask-Login and Flask-WTF)
  - `PostgreSQL` (Production database) / `SQLite` (Development)
  - `Modular CSS & JavaScript` (Decoupled architecture with responsive styles)
  - `Cropper.js` (Client-side interactive image cropping integration)
  - `Chart.js` (Administrative revenue, profit, and expense analytics)
  - `Render` (Production hosting)
- **Key Highlights**:
  - Refactored a monolithic frontend into structured modular CSS files (admin, public, components, responsive) and decoupled JavaScript modules.
  - Integrated an administrative media management pipeline featuring a reusable interactive image cropper.
  - Conducted a comprehensive security and reliability audit, identifying and remediating vulnerabilities including hardening the password-reset flow against account takeover.
  - Designed the brand identity system, including logo iterations, social assets, and print-ready business cards.
  - Authored a full-codebase architectural study guide documenting system workflows, data schemas, and deployment patterns.

---

### 4. Awaken Your Inner Power — Life Coaching Platform

- **Sort Order**: `4`
- **Category**: Production Client Platform
- **Live URL**: `https://awakenyourinnerpower.co.in`
- **Description**:
  > A complete appointment booking web application developed and maintained for an active life-coaching and therapy practice. Owns and operates the platform end-to-end — from structured appointment scheduling and WhatsApp notifications to administrative schedule management and brand identity.
- **Tech Stack**:
  - `Flask` (Application framework)
  - `PostgreSQL` / `Supabase` (Cloud relational database)
  - `FullCalendar.js` (Interactive availability calendar)
  - `CallMeBot WhatsApp API` (Automated booking notification delivery)
  - `Render` (Production web hosting with custom domain and HTTPS)
  - `Resend` (Transactional email messaging)
- **Key Highlights**:
  - Online appointment booking system with real-time slot availability checking, unique reference code generation, and payment confirmation via WhatsApp.
  - Administrative dashboard for managing booking requests, tracking payment status, and blocking or reopening appointment slots.
  - End-to-end production deployment on Render with Supabase PostgreSQL and custom domain configuration (`awakenyourinnerpower.co.in`).
  - Created the complete brand identity system centered around a signature lotus logo motif.
  - Packaged with technical README documentation and open-source licensing.

---

## 5. Technical Skills (`skills` & `skill_domains` Tables)

### Domain 1: Backend (Sort Order: 1)

- **Python**: Core
- **Flask**: Core
- **REST API Design**: Core
- **JWT Authentication**: Core
- **API Validation & Error Handling**: Core
- **FastAPI**: Hands-on
- **SQLAlchemy**: Hands-on
- **Background Jobs / APScheduler**: Hands-on
- **Rate Limiting**: Hands-on

### Domain 2: Databases (Sort Order: 2)

- **PostgreSQL**: Core
- **SQL**: Core
- **Database Design**: Core
- **Schema Design & Normalization**: Core
- **SQLite**: Hands-on
- **MySQL**: Hands-on
- **Alembic / Database Migrations**: Hands-on

### Domain 3: Frontend (Sort Order: 3)

- **HTML**: Hands-on
- **CSS**: Hands-on
- **JavaScript**: Hands-on
- **Vanilla JavaScript**: Hands-on
- **Responsive UI**: Hands-on

### Domain 4: Testing & Delivery (Sort Order: 4)

- **Pytest**: Core
- **API Testing**: Core
- **Git & GitHub**: Core
- **Environment Configuration**: Core
- **GitHub Actions / CI**: Hands-on
- **Deployment / Hosting**: Hands-on
- **Render**: Hands-on
- **Railway**: Hands-on

### Domain 5: Engineering Practices (Sort Order: 5)

- **API Architecture**: Core
- **Authentication & Authorization**: Core
- **Input Validation**: Core
- **Error Handling**: Core
- **Technical Documentation**: Hands-on
- **CI/CD Practices**: Hands-on
- **Background Processing**: Hands-on

---

## 6. Academic Background (`education` Table)

- **Qualification**: `B.E. Computer Science Engineering`
- **Institution**: `Dhaanish Ahmed College of Engineering, Chennai`
- **Start Year**: `2022`
- **End Year**: `2026`
- **Grade**: `CGPA: 8.01 / 10`
- **Coursework & Focus**: `Core coursework in Data Structures & Algorithms, Database Management Systems, Operating Systems, Computer Networks, and Object-Oriented Software Engineering.`
- **Sort Order**: `1`

---

## 7. Technical Documentation Overview (`readme_config`)

### Singleton Content

```markdown
> ## portfolio-os
>
> A developer portfolio that pretends to be VS Code — sidebar file tree, tabs, a working terminal, 13 switchable themes — backed by a real FastAPI + PostgreSQL API with a private CMS admin panel.
>
> **Why build it this way?** Because a portfolio *about* backend engineering should probably have some backend engineering in it. Every piece of content here — projects, skills, even this README — is a row in a database, editable through an admin panel, not hardcoded HTML.
>
> **Stack:** FastAPI · SQLAlchemy · PostgreSQL · vanilla JS · deployed on Render
>
> Check the sidebar. Try the terminal. Type `help`.
```

---

## 8. Contact & Social Channels (`contact_links` Table)

| Platform | URL / Value | Icon Identifier | Enabled | Sort Order |
| --- | --- | --- | --- | --- |
| **Email** | `mailto:ibrahimchennai2005@gmail.com` | `email` | `true` | `1` |
| **LinkedIn** | `https://www.linkedin.com/in/mohamed-ibrahim-y/` | `linkedin` | `true` | `2` |
| **GitHub** | `https://github.com/Ibrahim-2005` | `github` | `true` | `3` |

### Server-Backed Contact Form (`contact_config`)

- **Top Comment**: `// contact`
- **Heading**: `Get in Touch`
- **Endpoint**: `POST /api/contact`
- **Protection**: SlowAPI rate limiting (5 submissions per minute per client IP)
- **Form Fields**: Full Name, Email Address, Phone (Optional), Subject, Message
- **Persistence**: Saved to `messages` table in PostgreSQL for administrative review

---

## 9. Sidebar Navigation Initial Structure (`sidebar_items` Table)

| Slug | Label | Virtual Extension | Sort Order | Is Visible |
| --- | --- | --- | --- | --- |
| `home` | Home | *(None)* | `1` | `true` |
| `about` | About Me | `.html` | `2` | `true` |
| `projects` | Projects | `.sql` | `3` | `true` |
| `skills` | Skills | `.json` | `4` | `true` |
| `resume` | Resume | `.pdf` | `6` | `true` |
| `contact` | Contact | `.jwt` | `7` | `true` |
| `readme` | README | `.md` | `8` | `true` |

>Education is not seeded as a standalone sidebar item. It is displayed within the About page and is also accessible >through the terminal education command as a dedicated .edu virtual view.
