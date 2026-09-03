# Testing Guide — PortfolioOS

| Attribute | Value |
| --- | --- |
| **Document Name** | Automated Testing & Quality Assurance Guide |
| **Product Name** | PortfolioOS |
| **Document Version** | 1.0 |
| **Status** | Approved |
| **Release** | PortfolioOS v1.0 |
| **Last Updated** | September 2026 |
| **Target Repository** | [github.com/Ibrahim-2005/portfolio](https://github.com/Ibrahim-2005/portfolio) |

---

## 1. Overview

PortfolioOS maintains an automated test suite for the FastAPI backend using **Pytest**. The suite verifies API route handling, Pydantic request/response validation, authentication and token expiration, database models, rate limiting, and administrative CRUD operations.

The suite executes in under 30 seconds, runs against an isolated in-memory SQLite database, and requires no running external services or live network connections.

---

## 2. Test Framework & Architecture

The testing stack consists of:

- **Pytest (`8.2.0`)**: Test runner and fixture framework. Configured via `backend/pytest.ini` with `asyncio_mode = auto`.
- **pytest-asyncio (`0.23.6`)**: Async test support for FastAPI endpoints.
- **HTTPX (`0.27.0`)**: Asynchronous test client (`httpx.AsyncClient`) driving requests directly through ASGI without binding to a network port.
- **SQLAlchemy with SQLite In-Memory (`sqlite://`)**: Executes all tests against an ephemeral in-memory database using `StaticPool` to ensure complete isolation.

---

## 3. Test Organization & Coverage

All tests reside under `backend/tests/`. The test suite consists of **19 test files** comprising **107 test cases**:

| Test File | Tests | Functional Scope |
| --- | --- | --- |
| `test_admin_auth.py` | 10 | Login flow, bcrypt verification, JWT creation, token expiry, invalid credentials, rate limiting (5/min), and 401 unauthorized states. |
| `test_admin_crud.py` | 15 | Full administrative CRUD across projects, skills, contact message read toggling, analytics summary queries, and auth boundaries. |
| `test_analytics.py` | 2 | Background telemetry ingestion (`POST /api/analytics/event`) returning 202 Accepted, schema validation, and database persistence. |
| `test_cloudinary_service.py` | 3 | Image upload and deletion error handling with and without configured Cloudinary credentials. |
| `test_contact.py` | 4 | Contact form message submission, email validation, optional phone and subject fields, and IP rate limiting. |
| `test_contact_links.py` | 7 | Public enabled links retrieval, admin link CRUD, 404 responses for nonexistent records, and invalid payload rejection. |
| `test_data_migration.py` | 7 | Migration helper functions for normalizing legacy skill proficiencies and project tech stack data structures. |
| `test_education.py` | 7 | Public education history listing, chronological sort order, and admin education CRUD operations. |
| `test_entities_schema.py` | 5 | Pydantic model validation for core entities: Education, SkillDomain, ContactLink, Project, and Skill. |
| `test_guestbook.py` | 2 | Public submission and default approval state behavior. |
| `test_models_structure.py` | 1 | Introspection across all SQLAlchemy models confirming expected table names and columns. |
| `test_pages.py` | 15 | Public singleton page retrieval and admin updates for `home`, `about`, `projects`, `skills`, `resume`, `contact`, `readme`, `certificates`, and `settings`. |
| `test_projects.py` | 2 | Public project listing, response structure, and sort order verification. |
| `test_resume.py` | 6 | Public resume streaming (`GET /api/resume`), HEAD probe, static file fallback handling, and admin PDF binary upload (`POST /api/admin/resume/upload`). |
| `test_seed.py` | 1 | Database seeding verification for an unpopulated database.. |
| `test_sidebar.py` | 9 | Explorer tree item listing, public visibility filtering, legacy binary icon serving, sort order, and admin metadata updates. |
| `test_singletons_schema.py` | 1 | Schema validation across all 9 singleton page configuration models. |
| `test_skill_domains.py` | 7 | Public and admin skill domain management, sorting, and foreign-key conflict rejection on delete. |
| `test_skills.py` | 3 | Public grouped skills endpoint (`GET /api/skills`) and domain relationship ordering. |

---

## 4. Test Fixtures & Database Isolation

Test isolation is managed in [`backend/tests/conftest.py`]

### 4.1 In-Memory Database & StaticPool

```python
TEST_DATABASE_URL = "sqlite://"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
```

`StaticPool` keeps the same in-memory SQLite connection available throughout each test, allowing the application and test code to share the test database.

### 4.2 SQLite Foreign Key Enforcement

By default, SQLite does not enforce foreign key constraints. A connection listener enables foreign keys immediately upon connection:

```python
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
```

### 4.3 Clean Database Per Test

An auto-use fixture resets the database schema before and after each test function:

```python
@pytest.fixture(autouse=True)
def _reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
```

This guarantees complete test independence: no test can leak records or affect another test's state.

### 4.4 Authentication Fixture (`auth_headers`)

Tests requiring administrator access use the `auth_headers` fixture, which automatically creates an `AdminUser` record and generates a signed Bearer JWT token:

```python
@pytest.fixture
def auth_headers(db_session: Session) -> dict[str, str]:
    # Creates test admin user and returns {"Authorization": f"Bearer {token}"}
```

---

## 5. How to Run Tests

Run all commands from the `backend/` directory with the virtual environment activated.

### 5.1 Run the Full Test Suite

```bash
pytest
```

### 5.2 Run with Verbose Output

Displays each test name and pass/fail indicator:

```bash
pytest -v
```

### 5.3 Run a Specific Test File

```bash
pytest tests/test_contact.py
```

### 5.4 Run a Specific Test Case by Name

```bash
pytest -k "test_contact_rate_limit"
```

### 5.5 Run with Output Capture Disabled (Print Statements)

```bash
pytest -s
```

---

## 6. Continuous Integration (CI)

PortfolioOS runs its test suite automatically on every push and pull request to the `main` branch via GitHub Actions (`.github/workflows/ci.yml`).

The CI workflow:

1. Spawns an official **PostgreSQL 16** container service with health checks.
2. Sets up Python 3.12 with pip caching.
3. Installs dependencies from `backend/requirements.txt`.
4. Executes database migrations: `alembic upgrade head`.
5. Runs the Ruff linter: `ruff check .`.
6. Executes the test suite: `pytest`.

Any linter failure, migration error, or failing test blocks the pull request from merging.

---

## 7. Developer Validation Workflow

Before committing changes or opening a pull request, run the following verification sequence locally:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Check for linting errors and style violations
ruff check .

# 3. Run the complete automated test suite
pytest

# 4. Verify test database migrations run cleanly against local Postgres
alembic check
```

---

## 8. Critical Regression Watchpoints

When modifying backend components, pay particular attention to these areas:

1. **SlowAPI Rate Limits**: Endpoints like `POST /api/contact` and `POST /api/auth/login` enforce a 5 requests per minute limit per client IP. In tests, multiple rapid calls will return `429 Too Many Requests`. Tests verifying rate limits must account for IP keying.
2. **PostgreSQL vs. SQLite Compatibility**: In production, PostgreSQL handles JSON (`JSONB`) and Array types natively. Tests run under SQLite. Always verify that new model columns function correctly under both dialects (using `types.py` or `with_variant` where necessary).
3. **Database Dependency Injection**: Admin route protection uses `Depends(get_current_admin_user)`. To avoid circular imports between `security.py` and `database.py`, `_wire_db_dependency()` patches the parameter at import time. Do not bypass this dependency pattern.
4. **Cascade Deletions**: Deleting a `SkillDomain` cascades to delete associated `Skill` records. Tests in `test_skill_domains.py` verify that foreign key relationships are strictly respected.
