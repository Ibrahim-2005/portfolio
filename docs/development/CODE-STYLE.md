# Code Style & Engineering Standards — PortfolioOS

| Attribute | Value |
| --- | --- |
| **Document Name** | Code Style & Engineering Standards |
| **Product Name** | PortfolioOS |
| **Document Version** | 1.0 |
| **Status** | Approved |
| **Release** | PortfolioOS v1.0 |
| **Last Updated** | September 2026 |
| **Target Repository** | [github.com/Ibrahim-2005/portfolio](https://github.com/Ibrahim-2005/portfolio) |

---

## 1. Overview

PortfolioOS follows disciplined engineering conventions across both its Python backend and vanilla JavaScript/CSS frontend. Rather than adopting generic boilerplates, the codebase adheres to patterns tailored specifically to the project's architecture:

- **Backend**: Type-annotated FastAPI, SQLAlchemy 2.0 declarative models, Pydantic v2 schemas, decoupled service layer, and Alembic migrations.
- **Frontend**: Native browser ES modules (`type="module"`), observable state pattern, event-driven DOM communication, and CSS custom property design tokens.

---

## 2. Backend Conventions (Python / FastAPI)

### 2.1 Code Formatting & Linting

The backend codebase is formatted and linted with **Ruff** (`ruff.toml`):

- Line length limit: **100 characters**
- Double quotes for string literals
- Formatted imports sorted according to `isort` conventions
- Python version target: **Python 3.12**

Run the linter locally via:

```bash
ruff check .
```

### 2.2 Layered Architecture: Routers vs. Services vs. Models

To maintain testability and prevent monolithic route files, PortfolioOS enforces a 3-layer architecture:

```
[HTTP Request]
      │
      ▼
┌──────────────┐     Validates payload with Pydantic schema
│ Router Layer │ ──> Handles status codes, headers, and rate limits
└──────────────┘     Kept thin (no raw business logic)
      │
      ▼
┌───────────────┐    Executes business logic, queries, aggregations,
│ Service Layer │ ──> and multi-step operations
└───────────────┘    Decoupled from FastAPI transport
      │
      ▼
┌──────────────┐     SQLAlchemy declarative models defining tables,
│ Model Layer  │ ──> column types, constraints, and relationships
└──────────────┘
```

- **Router handlers must remain thin**: A route function should parse parameters, call a service function, and return the response schema.
- **Services own data manipulation**: Operations such as aggregating telemetry (`analytics_service.py`), resolving icons (`cloudinary_service.py`), or updating singleton records (`page_service.py`) live in `app/services/`.

### 2.3 Naming Conventions

- **Files**: `snake_case.py` (e.g. `skill_domain_service.py`, `contact_link.py`)
- **Classes**: `PascalCase` (e.g. `ProjectOut`, `SidebarItem`, `AdminUser`)
- **Functions & Methods**: `snake_case()` (e.g. `get_current_admin_user()`, `seed_projects()`)
- **Variables & Attributes**: `snake_case` (e.g. `sort_order`, `is_visible`)
- **Configuration & Constants**: `UPPER_SNAKE_CASE` (e.g. `ACCESS_TOKEN_EXPIRE_MINUTES`, `DATABASE_URL`)

### 2.4 SQLAlchemy 2.0 Models

All models in `app/models/` inherit from `Base` (`DeclarativeBase` in `app/core/database.py`):

- Use `Mapped[T]` type annotations for all columns.
- Explicitly define `__tablename__` matching snake_case plural names (e.g. `projects`, `sidebar_items`, `skill_domains`).
- Define column defaults using Python primitives or callable factories (`default=list`, `server_default="Core"`).
- Explicitly name indexes in `__table_args__` (e.g. `Index("ix_messages_is_read", "is_read")`).
- Use cross-dialect decorators (`app/models/types.py`) when storing arrays or JSON structures to ensure compatibility between SQLite (tests) and PostgreSQL (production).

### 2.5 Pydantic v2 Schemas

Request and response schemas in `app/schemas/` mirror domain models with distinct variants:

- `EntityBase`: Shared attributes.
- `EntityCreate`: Fields required for creation.
- `EntityUpdate`: Optional fields for partial or full updates.
- `EntityOut`: Fields returned to API clients, with `model_config = ConfigDict(from_attributes=True)`.
- Use `@field_validator` with `mode="before"` when deserializing complex payloads (such as supporting both string arrays and structured dictionary objects for project tech stacks).

### 2.6 Error Handling & Dependency Injection

- Always raise standard FastAPI `HTTPException` with explicit HTTP status codes (`status.HTTP_404_NOT_FOUND`, `status.HTTP_409_CONFLICT`, etc.) and informative `detail` strings.
- Never return empty 200 responses for failed lookups.
- Pass database sessions via `db: Session = Depends(get_db)`.
- Protect administration routes using `admin: AdminUser = Depends(get_current_admin_user)`.

---

## 3. Frontend Conventions (Vanilla JavaScript & CSS)

### 3.1 JavaScript Architecture (ES Modules)

The public interface and admin portal use native browser ES modules without bundlers or transpilers:

- Use standard `import` and `export` statements.
- Include explicit file extensions in imports (e.g. `import { state } from './state.js';`).
- Modules are loaded with `<script type="module">`.

### 3.2 Module Responsibilities

- **`core/`**: Infrastructure and shared state. Contains `api.js` (fetch client with caching and timeout handling), `state.js` (observable state management), and `router.js` (coordinating view rendering on state change).
- **`components/`**: UI views and structural regions. Contains view controllers (`home-view.js`, `projects-card.js`, `skills-view.js`, etc.) and editor chrome controllers (`sidebar.js`, `tabs.js`, `terminal.js`, `command-palette.js`).
- **`features/`**: Cross-cutting capabilities. Contains feature controllers (`theme-engine.js`, `cursor-engine.js`, `pet-companion.js`, `keyboard-shortcuts.js`).
- **`services/`**: Shared browser services such as `icon-service.js` (theme-aware icon resolution).

### 3.3 State Management & Event-Driven Pub/Sub

- The application uses an observable state pattern (`State` class in `core/state.js`).
- Direct DOM coupling between components is forbidden. Instead, components communicate via standard DOM `CustomEvent` dispatched on `document`:

  ```javascript
  // Dispatched by theme-engine.js:
  document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeId } }));

  // Listened to by icon-service.js and cursor-engine.js:
  document.addEventListener('themeChanged', (e) => {
    updateIconsForTheme(e.detail.theme);
  });
  ```

- **Fallback Protection**: The state engine guarantees that `home.py` cannot be closed if it is the sole remaining open tab, preventing broken empty workspace states.

### 3.4 CSS Architecture & Design Tokens

Stylesheets are organized hierarchically:

```
css/
├── base/        # reset.css, variables.css (token definitions), typography.css
├── layout/      # titlebar.css, activity-bar.css, sidebar.css, tabs.css, statusbar.css
├── components/  # Reusable section and element styles (buttons, cards, forms)
├── features/    # pets.css, cursor.css
├── responsive/  # tablet.css (600px–1024px), mobile.css (<600px)
└── themes/      # 13 theme files defining custom property values
```

#### Token Hierarchy Rules

1. **Names defined in `variables.css`**: Design token property names (`--bg-main`, `--fg-main`, `--accent`, `--border-color`, `--font-ui`) are defined on `:root`.
2. **Values assigned in `themes/*.css`**: Theme stylesheets only define token values scoped under `html[data-theme="<theme-id>"]`:

   ```css
   html[data-theme="dracula"] {
     --bg-main: #282a36;
     --fg-main: #f8f8f2;
     --accent: #ff79c6;
     --border-color: #44475a;
   }
   ```

3. **No inline styles for colors**: Components must reference CSS custom properties (`color: var(--fg-main);`) rather than hardcoded hex codes.

### 3.5 Responsive Breakpoint Standards

All media queries adhere to three explicit viewport tiers:

- **Mobile**: `@media (max-width: 599px)` (stacked cards, off-canvas drawer, terminal suppressed)
- **Tablet**: `@media (min-width: 600px) and (max-width: 1024px)` (touch drawer, scrollable tab bar, bottom terminal dock)
- **Desktop**: `@media (min-width: 1025px)` (full VS Code chrome, permanent sidebar, precision cursor)

---

## 4. Security & Defensive Programming

1. **Password Hashing**: Passwords must always be hashed with **bcrypt** via `passlib.context.CryptContext`. Plaintext passwords must never be stored or logged.
2. **Secret Keys**: `SECRET_KEY` is validated on startup to be at least 32 characters long.
3. **CORS Hardening**: Wildcard origins (`*`) are disallowed by configuration validators.
4. **HTML Sanitization**: All user-supplied markdown content (README, About biography) must pass through **DOMPurify** (`DOMPurify.sanitize(marked.parse(...))`) before insertion into the DOM to prevent cross-site scripting (XSS).
5. **Rate Limiting**: Public write endpoints (`/api/contact`, `/api/auth/login`) must be protected with SlowAPI rate limits to prevent brute-force attacks and spam.
6. **Ephemeral Storage Resilience**: Files requiring long-term persistence (such as uploaded resume PDFs) are stored directly in PostgreSQL (`BYTEA`), ensuring they survive container restarts on PaaS hosts like Render.
