# Development Setup — PortfolioOS

| Attribute | Value |
| --- | --- |
| **Document Name** | Local Development Setup Guide |
| **Product Name** | PortfolioOS |
| **Document Version** | 1.0 |
| **Status** | Approved |
| **Release** | PortfolioOS v1.0 |
| **Last Updated** | September 2026 |
| **Target Repository** | [github.com/Ibrahim-2005/portfolio](https://github.com/Ibrahim-2005/portfolio) |

---

## 1. Overview

PortfolioOS is a full-stack developer portfolio application with a Python (FastAPI) backend and a vanilla JavaScript/CSS frontend. The backend serves both the REST API endpoints (`/api/*`) and mounts the static frontend assets from a single process.

This guide explains how to configure, run, and test PortfolioOS locally from a fresh checkout.

---

## 2. Prerequisites

Ensure you have the following installed on your development machine:

- **Python**: Version `3.12.x` (verified with Python 3.12.4+)
- **Git**: Version `2.x` or higher
- **PostgreSQL**: Version `15` or `16` (recommended for production parity)
  - *Note*: An in-memory or file-based SQLite database (`sqlite:///portfolio_os.db`) can also be used for rapid local development and automated testing.

---

## 3. Repository Setup

Clone the repository and navigate into the project directory:

```bash
git clone https://github.com/Ibrahim-2005/portfolio.git
cd portfolio
```

The repository is structured with the backend application code in `backend/` and static frontend assets in `frontend/`.

---

## 4. Python Environment & Dependencies

1. Navigate to the `backend/` directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment:

   ```bash
   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate

   # On Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # On Windows (CMD):
   python -m venv venv
   .\venv\Scripts\activate.bat
   ```

3. Upgrade `pip` and install all dependencies:

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

Key packages installed include:

- `fastapi` and `uvicorn[standard]` for web services
- `sqlalchemy` and `alembic` for database modeling and migrations
- `psycopg2-binary` for PostgreSQL connectivity
- `python-jose[cryptography]` and `passlib[bcrypt]` for authentication
- `slowapi` for endpoint rate limiting
- `pytest` and `httpx` for test automation
- `ruff` for code linting

---

## 5. Configuration & Environment Variables

PortfolioOS reads its runtime settings using Pydantic Settings from `backend/.env`. A reference template is provided at `backend/.env.example`.

Copy the example file to `.env`:

```bash
# Inside the backend/ directory:
cp .env.example .env
```

Edit `backend/.env` to configure your local parameters:

| Variable | Required | Default / Example | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql://user:password@localhost:5432/portfolio_os` | PostgreSQL connection string (or `sqlite:///portfolio_os.db` for dev) |
| `SECRET_KEY` | Yes | *Random string (>= 32 chars)* | Secret key for signing JWT access tokens (validated on startup) |
| `ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | JWT token validity lifetime |
| `ALLOWED_ORIGINS` | No | `http://localhost:8000,http://127.0.0.1:8000` | Comma-separated CORS allowed origins (wildcard `*` is rejected) |
| `ADMIN_EMAIL` | Yes | `admin@example.com` | Email address for initial administrator login |
| `ADMIN_PASSWORD` | Yes | *Strong password* | Administrator password supplied to the initial account creation script; hashed before storage. |
| `GITHUB_REPO` | No | `Ibrahim-2005/portfolio` | GitHub repository identifier for source control telemetry |
| `GITHUB_TOKEN` | No | *Optional GitHub PAT* | Optional GitHub token to increase API rate limits for commit telemetry |
| `CLOUDINARY_*` | No | *Optional* | Cloudinary credentials for custom uploaded icon hosting |

> [!IMPORTANT]
> `SECRET_KEY` must be at least 32 characters long. If it is shorter or empty, the application will fail validation on startup.

---

## 6. Database Migrations & Initial Data

With your virtual environment active and `backend/.env` configured, apply database migrations, initialize the administrator account, and seed content.

### 6.1 Run Alembic Migrations

Apply all schema revisions to your database:

```bash
# Inside backend/
alembic upgrade head
```

This creates all database tables: singleton configuration tables, relational models (`projects`, `skills`, `skill_domains`, `education`, `contact_links`, `sidebar_items`), message storage, and analytics event logging.

### 6.2 Create the Initial Administrator User

Run the administrator creation utility:

```bash
python create_admin.py
```

This script reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`, hashes the password with bcrypt, and creates (or updates) the record in the `admin_user` table.

### 6.3 Seed Default Content

Populate the database with verified portfolio content:

```bash
python seed.py
```

`seed.py` is safe to run against an empty database; it checks `is_database_empty(db)` before inserting the initial seed data.
It populates:

- 7 default sidebar navigation items (`home`, `about`, `projects`, `skills`, `contact`, `readme`, `resume`)
- 4 featured software projects with structured tech stack tags and highlights
- 5 skill domains and 35 categorized skills with proficiency levels (*Core*, *Hands-on*, *Working*)
- Academic education record
- Social contact links (Email, LinkedIn, GitHub)
- Singleton configurations for Home, About, Projects, Skills, Resume, Contact, README, and Public Settings

---

## 7. Running the Application

Start the local development server with live reload:

```bash
# Inside backend/
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Because FastAPI mounts the `frontend/` directory as static files on the root path `/`, both the public interface and the API run from the single Uvicorn process.

---

## 8. Local Access URLs

Once Uvicorn is running, open your browser to access the following interfaces:

| Interface | URL | Description |
| --- | --- | --- |
| **Public Portfolio** | [http://localhost:8000/](http://localhost:8000/) | Full VS Code-styled public developer portfolio |
| **Admin CMS Dashboard** | [http://localhost:8000/admin/](http://localhost:8000/admin/) | Protected administration portal for content management |
| **API Documentation (Swagger)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive OpenAPI documentation and test runner |
| **API Documentation (ReDoc)** | [http://localhost:8000/redoc](http://localhost:8000/redoc) | Alternative formatted API specification |
| **Health Probe** | [http://localhost:8000/health](http://localhost:8000/health) | Liveness probe returning `{"status": "ok"}` |

To log into the Admin CMS:

1. Navigate to `http://localhost:8000/admin/`.
2. Enter the `ADMIN_EMAIL` and `ADMIN_PASSWORD` specified in your `.env`.
3. The dashboard authenticates via `POST /api/auth/login` and stores the resulting JWT token in session storage.

---

## 9. Common Development Commands

Run these common workflow commands from the `backend/` directory:

### Run Code Quality Linter

```bash
ruff check .
```

### Run Automated Test Suite

```bash
pytest
```

To run tests with verbose output:

```bash
pytest -v
```

### Generate a New Database Migration

When modifying SQLAlchemy models in `app/models/`:

```bash
alembic revision --autogenerate -m "describe schema change"
alembic upgrade head
```

---

## 10. Troubleshooting & Common Issues

### 1. `SECRET_KEY must be at least 32 characters`

- **Cause**: The `SECRET_KEY` in `.env` is shorter than 32 characters.
- **Fix**: Generate a long random string (e.g. `openssl rand -hex 32` or `python -c "import secrets; print(secrets.token_urlsafe(32))"`) and paste it into `.env`.

### 2. `CORS Wildcard Rejection`

- **Cause**: `ALLOWED_ORIGINS` contains `*`.
- **Fix**: PortfolioOS explicitly forbids wildcard origins in `app/core/config.py` for security. Specify exact origins such as `http://localhost:8000,http://127.0.0.1:8000`.

### 3. Static Assets Missing or 404

- **Cause**: Running Uvicorn from a working directory other than `backend/`.
- **Fix**: The static files mount resolves `../../frontend` relative to `backend/app/main.py`. Ensure you execute commands with `backend/` as the current working directory or ensure your path structure matches the standard repository layout.

### 4. SQLite Array Compatibility in Tests

- **Note**: The automated test suite (`backend/tests/conftest.py`) runs against an in-memory SQLite database (`sqlite://`). SQLite natively lacks PostgreSQL's `ARRAY` type. The project uses custom type decorators (`StringList` in `app/models/types.py`) and a session-level test fixture to seamlessly serialize lists as JSON under SQLite while preserving native PostgreSQL arrays in production.
