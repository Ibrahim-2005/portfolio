# Deployment Guide — PortfolioOS

| Attribute | Value |
| --- | --- |
| **Document Name** | Production Deployment & Infrastructure Guide |
| **Product Name** | PortfolioOS |
| **Document Version** | 1.0 |
| **Status** | Approved |
| **Release** | PortfolioOS v1.0 |
| **Last Updated** | September 2026 |
| **Target Repository** | [github.com/Ibrahim-2005/portfolio](https://github.com/Ibrahim-2005/portfolio) |

---

## 1. Overview

PortfolioOS is deployed as a unified, single-service web application. The Python backend, built with **FastAPI**, serves both the dynamic REST API endpoints (`/api/*`) and the static frontend assets (`frontend/`) from a single process.

Key deployment characteristics:

- **Unified Hosting**: A single web service serves the public portfolio, the administrative CMS (`/admin/`), and the REST API.
- **Authoritative Database**: A managed **PostgreSQL** instance stores all content entities, singleton page configurations, administrative credentials, telemetry events, and uploaded binary assets.
- **Zero Frontend Build Step**: The frontend is written in vanilla HTML, modern CSS, and browser-native ES modules. It requires no Node.js runtime, npm dependencies, bundler, or compilation pipeline in production.
- **Infrastructure as Code**: The production infrastructure is declaratively defined in [`render.yaml`] for automated provisioning on **Render**.

---

## 2. Production Architecture

The production environment connects the source code repository, hosting platform, managed database, and external telemetry APIs:

```mermaid
flowchart TD
    subgraph VCS["Source Control"]
        GH["GitHub Repository\n(Ibrahim-2005/portfolio)"]
    end

    subgraph Hosting["Render Production Platform"]
        Service["Web Service\n(portfolio-os-api)\nFastAPI + Uvicorn"]
        DB[(Managed PostgreSQL\nportfolio-os-db)]
        Static["Static Asset Mount\n(frontend/)"]
    end

    subgraph External["External Integrations (Optional)"]
        GitHubAPI["GitHub REST API\n(Source-Control Telemetry)"]
        Cloudinary["Cloudinary CDN\n(Custom Icon Media Storage)"]
    end

    GH -->|Git Push Webhook| Service
    Service -->|Database Connection\nDATABASE_URL| DB
    Service -->|Serves Static Files /| Static
    Service -.->|GET Commits / Branch\nGITHUB_TOKEN| GitHubAPI
    Service -.->|Upload / Delete Icons\nCLOUDINARY_*| Cloudinary
```

### External Services Summary

- **GitHub REST API**: Queried by `GET /api/source-control` to display repository branch and commit telemetry. Cached in-memory for 60 seconds. Gracefully falls back if unconfigured or unreachable.
- **Cloudinary CDN**: Optional cloud storage for custom sidebar and social link icon uploads. If unconfigured, icon upload endpoints return a `503 Service Unavailable` while core portfolio functionality continues unaffected.
- **Email Service (Resend / SMTP)**: Not configured in the v1.0 release. Contact form submissions are persisted directly to the PostgreSQL `messages` table and reviewed via the Admin CMS.

---

## 3. Production Infrastructure

PortfolioOS provisions two coordinated services on Render via `render.yaml`:

| Resource | Service Name | Type / Plan | Role |
| --- | --- | --- | --- |
| **Web Service** | `portfolio-os-api` | Web Service / Python | Runs the FastAPI application with Uvicorn, serves the REST API, and delivers static frontend assets. |
| **Database** | `portfolio-os-db` | PostgreSQL / Free or Starter | Authoritative relational data store for content, singletons, admin users, and binary resume PDFs. |

### Component Specifications

- **Runtime Environment**: Python `3.12.4` (pinned in `runtime.txt` and `.python-version`).
- **Application Server**: **Uvicorn** (`uvicorn[standard]`) running as an ASGI server.
- **Port Allocation**: Render dynamically assigns a listening port via the `$PORT` environment variable. Uvicorn binds to `0.0.0.0:$PORT`.
- **Health Checks**: Endpoint `/health` (supporting both `GET` and `HEAD`) responds with `200 OK` and `{"status": "ok"}` for container liveness probing.
- **Static Asset Serving**: Mounted via Starlette `StaticFiles(directory=frontend_path, html=True)` at root `/`. Configured as the final route handler so API routes take precedence.

---

## 4. Runtime & Build Configuration

The build and startup lifecycle is defined directly in `render.yaml` and executed in the `backend/` directory:

### 4.1 Build Stage

```bash
cd backend
pip install -r requirements.txt
```

Installs all pinned Python dependencies from `backend/requirements.txt` into the container environment. No JavaScript package manager (npm or yarn) is invoked.

### 4.2 Start Stage

```bash
cd backend
alembic upgrade head
python create_admin.py
python seed.py
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

The startup command executes four sequential steps before taking web traffic:

1. **`alembic upgrade head`**: Applies any pending schema migrations to the attached PostgreSQL database.
2. **`python create_admin.py`**: Reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` to create or update the administrative user account.
3. **`python seed.py`**: Checks if the database is unpopulated. If empty, seeds initial projects, skills, and configuration.
4. **`uvicorn app.main:app`**: Starts the production ASGI web server, binding to all interfaces (`0.0.0.0`) on the port assigned by Render.

---

## 5. Environment Variables & Secrets

All configuration is loaded via `pydantic-settings` in [`backend/app/core/config.py`] and from scripts. Never commit secrets to version control.

| Variable Name | Required | Default / Format | Secret? | Purpose & Scope |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/db` | Yes | PostgreSQL connection string. Injected automatically by Render via `fromDatabase`. |
| `SECRET_KEY` | **Yes** | Random string &ge; 32 characters | Yes | Cryptographic key used to sign and verify JWT access tokens. Validated at startup. |
| `ALGORITHM` | No | `HS256` | No | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | 60` | No | Lifetime of administrative JWT tokens before re-login is required. |
| `ALLOWED_ORIGINS` | No | `""` (Empty string) | No | Comma-separated list of allowed CORS origins. Wildcard `*` is explicitly forbidden. |
| `ADMIN_EMAIL` | **Yes** | `admin@example.com` | No | Email address for initial administrator account creation in `create_admin.py`. |
| `ADMIN_PASSWORD` | **Yes** | Password supplied through the deployment environment | Yes | And don't show an example password. |
| `GITHUB_REPO` | No | `Ibrahim-2005/portfolio` | No | GitHub repository (`owner/repo`) queried for source control telemetry. |
| `GITHUB_TOKEN` | No | `None` | Yes | Optional GitHub Personal Access Token to raise GitHub API rate limits from 60 to 5,000 req/hr. |
| `CLOUDINARY_CLOUD_NAME` | No | `None` | No | Cloudinary cloud identifier for custom icon uploads. |
| `CLOUDINARY_API_KEY` | No | `None` | Yes | Cloudinary API key for authentication. |
| `CLOUDINARY_API_SECRET` | No | `None` | Yes | Cloudinary API secret for signing upload requests. |
| `PORT` | **Yes** | Set by Render (e.g. `10000`) | No | Dynamic port provided by the hosting platform at container runtime. |

> [! IMPORTANT]
> `SECRET_KEY` must be at least 32 characters long. If it is shorter or blank, the FastAPI application will raise a validation error and refuse to start.

---

## 6. Database Deployment

### 6.1 Managed PostgreSQL

PostgreSQL is authoritative in production. The production database is provisioned through Render (`portfolio-os-db`) and connected using the internal database connection string (`DATABASE_URL`).

### 6.2 Schema Management via Alembic

Database schema revisions are managed through **Alembic** (`backend/alembic/`):

- Migrations are stored as sequential version files in `backend/alembic/versions/`.
- During deployment, `alembic upgrade head` runs automatically as part of the `startCommand`.
- If a migration fails (e.g. syntax error, lock timeout, or constraint violation), the startup script terminates with a non-zero exit code. Render halts the deployment and retains the previous healthy container.

### 6.3 Schema Evolution Guidelines

- Always write **additive, backward-compatible** migrations.
- Avoid locking entire production tables during peak traffic.
- Never run destructive commands (`alembic downgrade` or dropping tables) as part of an automated deployment pipeline.

---

## 7. Initial Application Provisioning

When deploying against a fresh, unpopulated database, the startup script performs an automated bootstrapping sequence:

1. **Schema Initialization**: `alembic upgrade head` runs all 13 migration revisions, creating all tables, indexes, and constraints.
2. **Administrator Provisioning**: `python create_admin.py` reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment. It verifies if an administrator record already exists:
   - If missing: inserts a new `AdminUser` record with the bcrypt-hashed password.
   - If present: updates the password hash to match the current environment variable.
3. **Conditional Content Seeding**: `python seed.py` executes the `run_seed()` function, which evaluates `is_database_empty(db)`:
   - **Empty Database**: Populates initial verified data (projects, skills, education, contact links, sidebar items, and singleton page configurations).
   - **Populated Database**: Detects existing records and **cleanly skips seeding**, printing:
     `Database already contains data. Skipping database seed to preserve production content.`
   - This prevents subsequent deployments from re-seeding an already populated database, preserving existing CMS content.

---

## 8. Static Frontend Deployment

The public portfolio interface is built with vanilla HTML5, CSS3, and JavaScript:

```
frontend/
├── index.html            # Main SPA entry point
├── site.webmanifest      # Progressive web app manifest
├── css/                  # Modular stylesheets (base, layout, components, themes, responsive)
├── js/                   # Native ES modules (main.js, core/, components/, features/, services/)
└── assets/               # Icons, sprites, favicons, PDF.js vendor library, and resume PDF
```

### Delivery Architecture

- **Mount Point**: FastAPI mounts the `frontend/` directory directly at `/`:

  ```python
  frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
  app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
  ```

- **Routing Precedence**: The static mount is registered as the last route in `backend/app/main.py`. Specific endpoints (`/api/*`, `/health`, `/docs`) take precedence.
- **Browser Execution**: Browsers load `frontend/js/main.js` using `<script type="module">`. Imports resolve standard browser URLs without needing compilation or bundle maps.

---

## 9. Domain, HTTPS & Health Checks

### 9.1 Custom Domain & HTTPS

- Render provides an automatic subdomain (e.g. `https://portfolio-os-api.onrender.com`).
- Custom domains can be configured in the Render Dashboard under **Settings > Custom Domains** by adding an `A` record or `CNAME` pointing to Render's servers.
- **Automatic TLS/SSL**: Render automatically provisions and renews Let's Encrypt certificates. HTTP traffic is automatically redirected to HTTPS.

### 9.2 Health Check Endpoint

- **URL**: `/health` (supports both `GET` and `HEAD` methods)
- **Response**: `200 OK` with payload `{"status": "ok"}`
- **Purpose**: Render pings `/health` during deployments. Traffic is only routed to the newly started container once this endpoint returns `200 OK`.

---

## 10. External Services

### 10.1 GitHub REST API

- **Endpoint**: `GET /api/source-control`
- **Configuration**:
  - `GITHUB_REPO`: `Ibrahim-2005/portfolio`
  - `GITHUB_TOKEN`: Optional GitHub Personal Access Token (classic or fine-grained with `repo:read` access).
- **Behavior**: Retrieves the latest commit hash, author, commit message, and relative date. Responses are cached in-memory for 60 seconds to conserve API limits.
- **Failure Resilience**: If the GitHub API is rate-limited or unavailable, the endpoint returns a structured fallback object rather than raising an HTTP 500 error.

### 10.2 Cloudinary (Optional)

- **Configuration**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Behavior**: Used by the administration panel to upload custom image icons for sidebar items and contact links.
- **Failure Resilience**: If credentials are unset, icon uploads return `503 Service Unavailable` with a descriptive message. The rest of the application functions normally.

---

## 11. Production Security Configuration

The production environment implements defense-in-depth security:

1. **Authentication & Passwords**:
   - Administrative endpoints under `/api/admin/*` require a signed JWT token passed in the `Authorization: Bearer <token>` header.
   - Passwords are encrypted using bcrypt with automatic salt generation via `passlib`. Raw passwords are never stored or written to logs.
2. **Token Integrity**:
   - Tokens are signed with `HS256` using `SECRET_KEY` (&ge; 32 characters). Expired or tampered tokens are rejected with `401 Unauthorized`.
3. **CORS Restrictions**:
   - Configured through `ALLOWED_ORIGINS`. Wildcard `*` origins are rejected by Pydantic validators when credentials are permitted.
4. **Rate Limiting**:
   - SlowAPI enforces per-IP limits on sensitive endpoints:
     - `POST /api/contact`: 5 requests per minute.
     - `POST /api/auth/login`: 5 requests per minute.
     - `GET /api/source-control`: 30 requests per minute.
5. **Content Security & Sanitization**:
   - Markdown rendered in the frontend is sanitized through DOMPurify to prevent Cross-Site Scripting (XSS).
6. **Ephemeral Storage Resilience**:
   - Resume PDFs uploaded through the Admin CMS are stored directly in PostgreSQL (`BYTEA` column in `resume_file` table), guaranteeing persistence across container rebuilds.

---

## 12. Deployment Troubleshooting

| Issue | Typical Symptom | Diagnosis & Solution |
| --- | --- | --- |
| **Alembic Migration Failure** | Deploy fails during `alembic upgrade head`; container does not start. | Review Render deploy logs for SQL errors. Ensure `DATABASE_URL` is correct and PostgreSQL is accepting connections. Check for unapplied intermediate migration scripts. |
| **Pydantic Validation Error at Startup** | Deploy logs display `ValueError: SECRET_KEY must be ... at least 32 characters`. | Ensure `SECRET_KEY` in Render environment variables is at least 32 characters long. Regenerate using `openssl rand -hex 32`. |
| **CORS Wildcard Error** | Startup fails with `ValueError: ALLOWED_ORIGINS cannot contain wildcard '*'`. | Update `ALLOWED_ORIGINS` in Render settings to specific hostnames (e.g. `https://yourdomain.com`), or leave blank for same-origin serving. |
| **Static Assets 404** | HTML loads but CSS/JS files return 404. | Verify that Uvicorn is executed from `backend/` as the working directory so `frontend_path` resolves `../../frontend` correctly. |
| **Database Connection Refused** | Uvicorn crashes with `psycopg2.OperationalError`. | Verify that the Render PostgreSQL service (`portfolio-os-db`) is in the **Available** state. Verify that `DATABASE_URL` uses the internal connection string. |
| **GitHub Rate Limiting** | `/api/source-control` returns fallback data; GitHub API logs 403. | Add a valid `GITHUB_TOKEN` to environment variables in Render to raise the rate limit from 60 to 5,000 requests per hour. |

---

## 13. Production Verification Reference

For operational procedures regarding releasing updates, refer to:

- **[`docs/deployment/RELEASE-PROCESS.md`]

Consult that document for:

- Pre-release local test verification (`pytest` and `ruff check .`)
- Version tagging workflow (`git tag -a v1.0.0`)
- Post-deployment smoke test runbook
- Render instant rollback and database recovery procedures
