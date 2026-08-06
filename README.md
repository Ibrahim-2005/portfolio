<div align="center">

# PortfolioOS

### A Production-Ready VS Code–Inspired Full-Stack Developer Portfolio

Built with **FastAPI**, **PostgreSQL**, and **Vanilla JavaScript**, PortfolioOS combines an interactive VS Code-inspired interface with a production-ready backend, secure CMS, REST APIs, analytics, and automated CI/CD.

<br>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Portfolio-2563EB?style=for-the-badge)](https://mohamed-ibrahim-y-portfolio.onrender.com)
[![CI](https://github.com/Ibrahim-2005/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Ibrahim-2005/portfolio/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](LICENSE)

<br>

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

<br>

**FastAPI • PostgreSQL • SQLAlchemy • JWT Authentication • REST APIs • Admin CMS • VS Code UI • 13 Themes • Interactive Terminal • GitHub Actions • Render**

</div>

---

# 📖 About the Project

**PortfolioOS** is a production-ready full-stack developer portfolio built as a real software product rather than a traditional static portfolio website.

Instead of hardcoding portfolio content into HTML pages, every section—including projects, skills, education, experience, resume, and portfolio content—is managed through a secure administrator dashboard backed by **FastAPI** and **PostgreSQL**.

The application recreates the familiar **Visual Studio Code** experience with a sidebar, tabs, command palette, interactive terminal, status bar, and **13 switchable editor themes**, while remaining intuitive enough for recruiters and non-technical visitors to navigate with ease.

Beyond showcasing my work, PortfolioOS demonstrates practical backend engineering through:

- RESTful API design
- JWT-based authentication
- Database-driven content management
- Layered application architecture
- Automated testing
- Continuous Integration with GitHub Actions
- Production deployment on Render

The portfolio itself serves as one of my flagship engineering projects, showcasing both software development practices and the projects it contains.

---

# 🎯 Why I Built It

Most portfolio websites are static collections of projects with very little engineering behind them. While they showcase work, they rarely demonstrate how the portfolio itself was designed, built, and maintained.

I wanted to create a portfolio that functions as a real software product—one that reflects the same engineering principles I apply to production applications.

PortfolioOS was built to solve several challenges:

- Demonstrate backend engineering through the portfolio itself.
- Manage content dynamically without modifying source code.
- Provide a memorable experience that stands out from generic portfolio templates.
- Present technical depth while remaining approachable for recruiters and non-technical visitors.
- Serve as a project I can confidently discuss during interviews, from system architecture to deployment.

The result is a portfolio that is both my professional website and one of my flagship full-stack engineering projects.

---

# ✨ Features

## 💻 Public Portfolio Experience

- 🖥️ Visual Studio Code-inspired interface
- 📂 Interactive sidebar with tab-based navigation
- 🎨 13 switchable editor themes with persistent preferences
- 🐾 Custom themed pet companions and cursors for easter-egg themes
- 🖥️ Interactive terminal with predefined developer commands
- 📁 Project showcase powered by REST APIs
- 🧠 Skills explorer
- 🎓 Education and professional profile
- 📄 Inline resume viewer
- ⬇️ Resume PDF download
- 📬 Contact form with server-side storage
- ✍️ Moderated public guestbook
- 📱 Fully responsive experience across desktop, tablet, and mobile

---

## 🔐 Administrator Experience

- 🔑 JWT-secured authentication
- 📝 Dynamic content management
- 📂 Project CRUD operations
- 🧠 Skills management
- 📄 Portfolio section editor
- 📄 Resume management
- 📬 Contact message inbox
- ✍️ Guestbook moderation
- 📊 Visitor analytics dashboard
- ⚡ Content updates without redeployment

---

## ⚙️ Engineering Features

- ⚡ FastAPI backend
- 🗄️ PostgreSQL database
- 🏗️ SQLAlchemy ORM
- 🔄 Alembic database migrations
- 🧪 Automated backend test suite
- 🔍 Ruff linting
- ⚙️ GitHub Actions Continuous Integration
- ☁️ Render production deployment
- 🔒 Rate limiting and request validation
- 📦 Layered application architecture

---

# 🛠️ Technology Stack

| Category                | Technology                      |
| ----------------------- | ------------------------------- |
| **Backend**             | FastAPI                         |
| **Language**            | Python 3.12                     |
| **Database**            | PostgreSQL                      |
| **ORM**                 | SQLAlchemy                      |
| **Database Migrations** | Alembic                         |
| **Authentication**      | JWT                             |
| **Frontend**            | HTML5, CSS3, Vanilla JavaScript |
| **Testing**             | Pytest                          |
| **Linting**             | Ruff                            |
| **CI/CD**               | GitHub Actions                  |
| **Deployment**          | Render                          |
| **Version Control**     | Git & GitHub                    |

---

# 🏗️ System Architecture

```text
                         ┌────────────────────┐
                         │     Web Browser    │
                         └─────────┬──────────┘
                                   │
                                   ▼
                     ┌──────────────────────────┐
                     │  VS Code Inspired UI     │
                     │ (HTML • CSS • JavaScript)│
                     └─────────┬────────────────┘
                               │ REST API
                               ▼
                     ┌──────────────────────────┐
                     │        FastAPI           │
                     │   Layered Architecture   │
                     └─────────┬────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
      JWT Authentication   SQLAlchemy ORM    Rate Limiting
            │                  │                  │
            └──────────────────┴──────────────────┘
                               │
                               ▼
                     ┌──────────────────────────┐
                     │      PostgreSQL DB       │
                     └──────────────────────────┘
```

PortfolioOS follows a layered architecture that separates routing, business logic, data models, and persistence. The frontend communicates with the backend through RESTful APIs, while SQLAlchemy manages database interactions. Administrator routes are protected using JWT authentication, and the application is continuously validated through automated testing and GitHub Actions before deployment to Render.

---

# 📚 Documentation

Comprehensive project documentation is available inside the `docs/` directory.

| Category                   | Document                                      |
| -------------------------- | --------------------------------------------- |
| 📋 Product Requirements    | `docs/planning/PRD.md`                        |
| 🎨 UI / UX Specification   | `docs/planning/UIUX-spec.md`                  |
| 🗺️ Implementation Plan     | `docs/planning/implementation-plan.md`        |
| 🌱 Seed Content            | `docs/planning/seed-content.md`               |
| 🏗️ Technical Requirements  | `docs/architecture/TRD.md`                    |
| 🗄️ Database Schema         | `docs/architecture/database-schema.md`        |
| 📁 Project Structure       | `docs/architecture/project-structure.md`      |
| 🔄 User Flow               | `docs/architecture/user-flow.md`              |
| 🛠️ Build Guide             | `docs/development/build-guide.md`             |
| 🚀 Antigravity Build Guide | `docs/development/build-guide_antigravity.md` |
| 📖 API Reference           | `docs/development/api-reference.md`           |
| 🌿 Git Workflow            | `docs/development/GIT-WORKFLOW.md`            |
| ☁️ Deployment Guide        | `docs/deployment/DEPLOY.md`                   |

The documentation captures the complete lifecycle of the project—from planning and architecture to implementation, deployment, and maintenance—making the repository easy to understand, extend, and contribute to.

---

# 📂 Project Structure

```text
portfolio/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   └── services/
│   └── tests/
│
├── frontend/
│   ├── admin/
│   ├── assets/
│   ├── css/
│   └── js/
│
├── docs/
│   ├── architecture/
│   ├── planning/
│   ├── development/
│   └── deployment/
│
├── .gitignore
├── LICENSE
├── README.md
├── render.yaml
└── runtime.txt
```

The repository follows a clear separation of concerns:

- **backend/** — FastAPI application, business logic, REST APIs, authentication, database models, migrations, and tests.
- **frontend/** — VS Code-inspired user interface built with HTML, CSS, and Vanilla JavaScript.
- **docs/** — Product planning, architecture, implementation, deployment, and development documentation.
- **.github/** — Continuous Integration workflow powered by GitHub Actions.

---

# 🚀 Getting Started

## Prerequisites

Before running the project locally, make sure you have:

- Python 3.12+
- PostgreSQL
- Git
- A virtual environment tool (`venv` recommended)

---

## Clone the Repository

```bash
git clone https://github.com/Ibrahim-2005/portfolio.git

cd portfolio
```

---

## Backend Setup

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file inside the `backend/` directory.

Use `.env.example` as the reference configuration.

---

## Database Setup

Run database migrations:

```bash
alembic upgrade head
```

Seed the database:

```bash
python seed.py
```

---

## Start the Backend

```bash
uvicorn app.main:app --reload
```

---

## Open the Frontend

Open:

```text
frontend/index.html
```

or serve it using your preferred local development server.

The application will communicate with the running FastAPI backend.

---

# 🧪 Testing & Code Quality

PortfolioOS follows a quality-first development workflow with automated testing, linting, and Continuous Integration to ensure every change is validated before deployment.

## Run the Test Suite

```bash
cd backend

pytest
```

---

## Run Ruff Linter

```bash
cd backend

ruff check .
```

---

## Continuous Integration

Every push and pull request to the `main` branch automatically triggers the GitHub Actions workflow, which performs:

- ✅ Dependency installation
- ✅ Ruff linting
- ✅ Pytest execution
- ✅ CI status reporting

The current build status is available through the badge at the top of this README.

---

## Test Coverage

The backend test suite validates:

- JWT authentication
- Administrator CRUD operations
- Public REST API endpoints
- Contact form
- Guestbook moderation
- Resume endpoints
- Analytics
- Database seeding
- Skills and Projects APIs

This ensures the application's core functionality remains reliable as the project evolves.

---

# ☁️ Deployment

PortfolioOS is deployed on **Render** using a production-ready configuration.

### Live Application

🌐 **Portfolio:** https://mohamed-ibrahim-y-portfolio.onrender.com

---

### Deployment Stack

- Render Web Service
- Python 3.12
- FastAPI
- PostgreSQL
- GitHub Integration
- GitHub Actions CI

---

### Deployment Process

Deployment follows a straightforward workflow:

1. Push changes to GitHub.
2. GitHub Actions validates the project by running linting and tests.
3. Render automatically pulls the latest changes from the repository.
4. The application is built and deployed to production.

Deployment configuration is maintained through:

- `render.yaml`
- `runtime.txt`
- `.python-version`

Detailed deployment instructions are available in:

```text
docs/deployment/DEPLOY.md
```

---

# 🚀 Roadmap

While PortfolioOS is production-ready, several enhancements are planned for future releases.

## Planned Improvements

- Plain View mode for non-technical visitors
- Blog and article publishing system
- Search across projects and documentation
- Dark/Light theme auto-detection
- Enhanced analytics dashboard
- Containerized deployment with Docker
- API documentation with Swagger enhancements
- Performance optimizations and caching


Contributions, suggestions, and feedback are always welcome.

---

# 👨‍💻 Author

<div align="center">

## Mohamed Ibrahim

Backend Developer • Python • FastAPI • REST APIs

Building scalable backend systems, REST APIs, and full-stack applications with a focus on clean architecture, maintainability, and real-world engineering practices.

<br>

🌐 **Portfolio**  
https://mohamed-ibrahim-y-portfolio.onrender.com

💼 **LinkedIn**  
https://www.linkedin.com/in/mohamed-ibrahim-y/

💻 **GitHub**  
https://github.com/Ibrahim-2005

</div>

---

# 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for more information.

---

<div align="center">

### ⭐ If you found this project helpful or interesting, consider leaving a star on GitHub.

Thanks for checking out PortfolioOS!

</div>
