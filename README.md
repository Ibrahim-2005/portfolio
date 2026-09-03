<div align="center">

# PortfolioOS

**A VS Code–inspired developer portfolio backed by a production oriented FastAPI and PostgreSQL application.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Portfolio-2563EB?style=for-the-badge&logo=render&logoColor=white)](https://mohamed-ibrahim-y-portfolio.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ibrahim-2005/portfolio)
[![CI](https://img.shields.io/github/actions/workflow/status/Ibrahim-2005/portfolio/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=white&label=CI)](https://github.com/Ibrahim-2005/portfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](LICENSE)

<br>

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

<br>

**FastAPI • PostgreSQL • SQLAlchemy 2.0 • Pydantic v2 • Alembic • JWT Auth • Vanilla JS • 13 Themes • Interactive Terminal • Pytest • GitHub Actions • Render**

</div>

---

## About the Project

**The portfolio itself is the project.**

Most developer portfolios are static HTML/CSS templates or frontend mockups that display bullet points about backend engineering without demonstrating any of it in practice.

PortfolioOS was built to change that. Every section of this portfolio—projects, skills, education, bio, contact messages, resume files, and layout configuration—is backed by real backend engineering:

- **Database-Driven Content**: No hardcoded project cards. All portfolio entities live in structured PostgreSQL tables managed via SQLAlchemy 2.0 ORM.
- **Production REST APIs**: Layered FastAPI backend with clean routing, Pydantic v2 validation, error handling, and rate limiting.
- **Authenticated Headless CMS**: A private, JWT-authenticated administration dashboard (`/admin`) allowing full content updates without redeploying code.
- **Automated Verification**: A 107-test Pytest suite, strict Ruff linting, and automated GitHub Actions CI validating every push.
- **Single-Service Production Deployment**: Container-free Render deployment using Uvicorn and Starlette static file mounting, executing database migrations before accepting requests.

The interface recreates the familiar **Visual Studio Code** editor environment—complete with a sidebar file tree, editor tabs, command palette, interactive CLI emulator, status bar, and 13 switchable editor themes—while remaining intuitive for recruiters, hiring managers, and non-technical visitors.

---

## Core Highlights

### VS Code–Inspired Interface
- **Sidebar & Tabs**: Interactive explorer tree navigation, multi-tab switching, dirty state indicators, and closable tab management with a permanent home anchor.
- **13 Editor Themes**: 7 dark themes (*Dark+*, *Dracula*, *One Dark Pro*, *Monokai*, *Nord*, *Solarized Dark*, *Night Owl*), 3 light themes (*Light+*, *Solarized Light*, *GitHub Light*), and 3 special themes (*Project Hail Mary*, *Interstellar*, *F1*). Theme preferences persist in `localStorage`.
- **Theme Companions & Cursors**: Animated sprite companions (Rocky for *Project Hail Mary*, TARS for *Interstellar*, and an F1 car for *F1*) and theme-specific cursors that gracefully fall back on touch screens.
- **Integrated Terminal (Desktop & Tablet)**: Docked terminal emulator supporting commands like `help`, `whoami`, `about`, `education`, `skills`, `projects`, `resume`, `contact`, `socials`, `theme`, `clear`, and `sudo hire-me`. Features multiple bash sessions, history navigation, and tab auto-completion. Suppressed on mobile (< 600px) for ergonomics.
- **Command Palette & Quick Open**: Global fuzzy palette accessible via `Ctrl+P` (file switcher) and `Ctrl+Shift+P` (commands) with keyboard navigation.
- **Responsive Architecture**: Multi-device UX spanning desktop (> 1024px), tablet (600px–1024px), and mobile (< 600px) with dedicated drawer navigation, top filename bar, and 44px+ touch targets.

### Full-Stack Engineering
- **Inline Resume Viewer & Download**: Integrated PDF rendering via PDF.js with direct downloads served from PostgreSQL `BYTEA` storage.
- **Contact Inquiries**: Validated contact form with SlowAPI rate limiting (5 req/min) and database persistence.
- **Source Control Integration**: Live GitHub repository status fetching latest commit SHA and branch metadata with in-memory caching and offline fallback.
- **Private Admin Dashboard**: Gated CMS (`/admin`) protected by bcrypt password hashing and JWT Bearer authentication for managing projects, skills, education, messages, and configuration.
- **Visitor Analytics**: Privacy-respecting telemetry recording daily page-view buckets and top terminal commands.

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | HTML5, CSS3 (Custom Properties & Tokens), Vanilla JavaScript (ES Modules), PDF.js |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic, python-jose (JWT), passlib / bcrypt, SlowAPI |
| **Database** | PostgreSQL 16 (production), SQLite with Foreign Key enforcement (testing) |
| **Testing & Quality** | Pytest (107 tests), TestClient, Ruff linter, Coverage |
| **Delivery & CI/CD** | GitHub Actions, Git, Render Web Service, Uvicorn |

---

## Architecture

PortfolioOS deploys as a unified single-service web application backed by a managed PostgreSQL database:

```mermaid
flowchart TD
    Client["Client Browser<br/>(Desktop / Tablet / Mobile)"]

    subgraph Service["Unified Web Service (Render)"]
        FastAPI["FastAPI Application"]
        Static["Static File Mount<br/>(HTML, CSS, ES Modules)"]
        PublicAPI["Public REST API<br/>(/api/*)"]
        AdminAPI["Admin CMS API<br/>(/api/admin/* + JWT)"]
    end

    subgraph Storage["Managed Persistence"]
        Postgres[("PostgreSQL Database")]
    end

    Client -->|"HTTP GET / (Static Assets)"| Static
    Client -->|"REST Requests (JSON)"| PublicAPI
    Client -->|"Admin Dashboard (Bearer Token)"| AdminAPI
    Static -.-> FastAPI
    PublicAPI -->|"SQLAlchemy 2.0 ORM"| Postgres
    AdminAPI -->|"SQLAlchemy 2.0 ORM"| Postgres
```

### Layered Backend Design
1. **Routers** (`app/routers/`): Request routing, HTTP method handling, query parameter binding, dependency injection, and HTTP status codes.
2. **Schemas** (`app/schemas/`): Strict request/response validation and serialization with Pydantic v2 models.
3. **Services** (`app/services/`): Business logic, data aggregation, rate-limiting rules, and third-party integrations.
4. **Models** (`app/models/`): SQLAlchemy 2.0 declarative database models mapped to PostgreSQL tables.
5. **Core** (`app/core/`): Centralized Pydantic settings validation, database engine lifecycle, and security utilities.

---

## Project Structure

```text
portfolio/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI pipeline (linting, tests, migrations)
├── backend/
│   ├── alembic/                 # 13 versioned database migrations
│   ├── app/
│   │   ├── core/                # Configuration, database engine, security
│   │   ├── models/              # 20 SQLAlchemy declarative models
│   │   ├── routers/             # Public (/api) and Admin (/api/admin) endpoints
│   │   ├── schemas/             # Pydantic v2 serialization schemas
│   │   ├── services/            # Business logic and external service layers
│   │   └── main.py              # FastAPI app factory, middleware, static mounting
│   ├── tests/                   # Automated Pytest suite (107 tests across 19 modules)
│   ├── create_admin.py          # Initial admin provisioning script
│   ├── requirements.txt         # Pinned backend dependencies
│   ├── ruff.toml                # Linting and formatting configuration
│   └── seed.py                  # Production seeding with database-empty check
├── frontend/
│   ├── admin/                   # JWT-authenticated CMS dashboard
│   ├── assets/                  # Favicons, SVGs, sprites, icons, and PDF.js
│   ├── css/                     # CSS architecture (base, layout, themes, responsive)
│   └── js/                      # ES Modules (core, components, features, services)
├── docs/                        # Complete 17-document engineering documentation suite
├── render.yaml                  # Infrastructure-as-Code blueprint for Render
├── runtime.txt                  # Python 3.12.4 runtime specification
└── README.md                    # Repository documentation
```

---

## Local Development

Follow these steps to run PortfolioOS locally. For complete setup notes and troubleshooting, see [DEVELOPMENT-SETUP.md](docs/development/DEVELOPMENT-SETUP.md).

### 1. Prerequisites
- Python 3.12+
- PostgreSQL (or SQLite for local development)
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/Ibrahim-2005/portfolio.git
cd portfolio
```

### 3. Set Up Virtual Environment
```bash
cd backend
python -m venv venv
```

Activate the environment:
- **Windows (PowerShell)**: `venv\Scripts\Activate.ps1`
- **macOS / Linux**: `source venv/bin/activate`

Install dependencies:
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy the template configuration:
```bash
cp .env.example .env
```

Ensure `.env` contains:
```ini
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_os
SECRET_KEY=your_secure_random_key_at_least_32_characters_long
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_to_a_secure_password
```

### 5. Run Migrations & Seed Database
Apply database schema migrations:
```bash
alembic upgrade head
```

Create the initial administrator account:
```bash
python create_admin.py
```

Seed initial portfolio content (projects, skills, education, layout):
```bash
python seed.py
```

### 6. Start the Server
```bash
uvicorn app.main:app --reload
```

Open your browser to:
- **Portfolio**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Admin CMS**: [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)
- **API Docs (Swagger)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Testing & Quality Assurance

PortfolioOS maintains strict engineering standards with an automated test suite and linting rules.

### Run Unit & Integration Tests
```bash
cd backend
pytest
```
*Current verified status*: **107 passed** across 19 test modules in ~20 seconds.

### Run Code Linter
```bash
cd backend
ruff check .
```
*Current verified status*: **All checks passed!** (0 errors).

### Continuous Integration (CI)
Every commit and pull request to `main` triggers [.github/workflows/ci.yml](.github/workflows/ci.yml), which spins up a PostgreSQL 16 container, applies Alembic migrations, verifies code style with Ruff, and executes the full Pytest test suite.

For testing conventions and mock configurations, see [TESTING.md](docs/development/TESTING.md).

---

## Production Deployment

PortfolioOS deploys to **Render** as a unified web service with an attached PostgreSQL database.

### Infrastructure Blueprint
Defined in [render.yaml](render.yaml):
- **Service Type**: Web Service (`env: python`)
- **Runtime**: Python 3.12.4 (`runtime.txt`)
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**:
  ```bash
  cd backend && alembic upgrade head && python create_admin.py && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

FastAPI serves the static frontend assets directly from the root mount while handling API traffic under `/api`. Database migrations, admin provisioning, and empty-database seeding run during startup before the application begins serving requests.

Detailed deployment procedures and rollback runbooks are documented in [DEPLOY.md](docs/deployment/DEPLOY.md) and [RELEASE-PROCESS.md](docs/deployment/RELEASE-PROCESS.md).

---

## Project Documentation

PortfolioOS includes a comprehensive 17-document technical documentation suite located in `docs/`:

| Phase | Document | Description |
| --- | --- | --- |
| **Planning** | [PRD.md](docs/planning/PRD.md) | Product Requirements Document and feature specifications |
| | [UIUX-spec.md](docs/planning/UIUX-spec.md) | Design tokens, VS Code shell layout, and responsive breakpoints |
| | [implementation-plan.md](docs/planning/implementation-plan.md) | Phased engineering roadmap and milestone deliverables |
| | [seed-content.md](docs/planning/seed-content.md) | Verified initial content inventory and database seed data |
| **Architecture** | [TRD.md](docs/architecture/TRD.md) | Technical Requirements Document and system architecture |
| | [database-schema.md](docs/architecture/database-schema.md) | Entity relationship diagrams, constraints, and data dictionaries |
| | [project-structure.md](docs/architecture/project-structure.md) | Complete directory layout and file-by-file responsibility guide |
| | [user-flow.md](docs/architecture/user-flow.md) | State transitions, navigation paths, and API sequence diagrams |
| **Development** | [DEVELOPMENT-SETUP.md](docs/development/DEVELOPMENT-SETUP.md) | Comprehensive local setup, environment configuration, and runbook |
| | [API-REFERENCE.md](docs/development/API-REFERENCE.md) | Complete REST API specification with schemas and rate limits |
| | [TESTING.md](docs/development/TESTING.md) | Automated testing strategy, fixture lifecycle, and test catalog |
| | [CODE-STYLE.md](docs/development/CODE-STYLE.md) | Engineering conventions, layered architecture rules, and styling |
| | [GIT-WORKFLOW.md](docs/development/GIT-WORKFLOW.md) | Conventional Commits, branch naming, and release tagging |
| | [KEYBOARD-SHORTCUTS.md](docs/development/KEYBOARD-SHORTCUTS.md) | Reference catalog of all keyboard accelerators and chords |
| | [COMPLETE-360-AUDIT.md](docs/development/COMPLETE-360-AUDIT.md) | Full 18-dimension repository health check and audit log |
| **Deployment** | [DEPLOY.md](docs/deployment/DEPLOY.md) | Production deployment architecture, Render setup, and operations |
| | [RELEASE-PROCESS.md](docs/deployment/RELEASE-PROCESS.md) | Release verification, semantic tagging, and rollback runbook |

---

## Author

**Mohamed Ibrahim Y**  
Backend Developer & Software Engineer  

- **Live Portfolio**: [https://mohamed-ibrahim-y-portfolio.onrender.com](https://mohamed-ibrahim-y-portfolio.onrender.com)
- **LinkedIn**: [https://www.linkedin.com/in/mohamed-ibrahim-y/](https://www.linkedin.com/in/mohamed-ibrahim-y/)
- **GitHub**: [https://github.com/Ibrahim-2005](https://github.com/Ibrahim-2005)

---

## License

This project is open-source software licensed under the [MIT License](LICENSE).
