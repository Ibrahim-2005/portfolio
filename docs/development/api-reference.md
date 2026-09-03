# API Reference — PortfolioOS

| Attribute | Value |
| --- | --- |
| **Document Name** | REST API Specification |
| **Product Name** | PortfolioOS |
| **Document Version** | 1.0 |
| **Status** | Approved |
| **Release** | PortfolioOS v1.0 |
| **Last Updated** | September 2026 |
| **Target Repository** | [github.com/Ibrahim-2005/portfolio](https://github.com/Ibrahim-2005/portfolio) |

---

## 1. Overview

PortfolioOS provides a REST API built with **FastAPI**. The API serves public portfolio content, handles visitor contact submissions and telemetry, provides authentication, and offers administrative management endpoints for CMS operations.

- **Base URL**: `/api`
- **Authentication**: Stateless Bearer JWT tokens via `Authorization: Bearer <token>`
- **Response Format**: JSON (`application/json`) with custom binary responses for resume PDF streaming and uploaded icons
- **Rate Limiting**: Enforced via **SlowAPI** on public write and telemetry endpoints
- **Validation**: Enforced via **Pydantic v2** request and response models

---

## 2. Public Endpoints (Unauthenticated)

### 2.1 Navigation & Shell

#### `GET /api/sidebar`

Returns all enabled sidebar file tree items ordered by `sort_order`.

- **Authentication**: None
- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "slug": "home",
    "label": "home.py",
    "extension": ".py",
    "icon_url": null,
    "icon_mime": null,
    "sort_order": 0,
    "is_visible": true
  }
]
```

#### `GET /api/sidebar/{id}/icon`

Streams the legacy custom binary icon stored in the database for a sidebar item.

- **Parameters**: `id` (integer, path)
- **Response**: `200 OK` (binary stream with appropriate `Content-Type`), or `404 Not Found` if no custom icon exists.

---

### 2.2 Content Pages & Singletons

#### `GET /api/pages/{slug}`

Retrieves singleton page configuration for a given section slug (`home`, `about`, `projects`, `skills`, `resume`, `contact`, `settings`).

- **Parameters**: `slug` (string, path)
- **Response**: `200 OK`

Example: `GET /api/pages/home`

```json
{
  "top_text": "// main.py",
  "name": "Mohamed Ibrahim Y",
  "tagline": "Building real, working software 🚀",
  "intro": "Full-Stack Engineer & Designer",
  "roles": [
    {"label": "Backend Developer"},
    {"label": "Full-Stack"},
    {"label": "Freelancer & Educator"}
  ],
  "social_links": [
    {"platform": "GitHub", "url": "https://github.com/Ibrahim-2005", "icon": "github"},
    {"platform": "LinkedIn", "url": "https://linkedin.com/in/ibrahim-2005", "icon": "linkedin"}
  ],
  "action_projects_label": "Projects",
  "action_about_label": "About Me",
  "action_contact_label": "Contact"
}
```

#### `GET /api/pages/readme`

Retrieves the formatted markdown content for the README section.

- **Response**: `200 OK`

```json
{
  "content": "# PortfolioOS v1.0\n\nA full-stack, VS Code-inspired developer portfolio..."
}
```

### 2.3 Portfolio Content Entities

#### `GET /api/projects`

Retrieves all featured projects ordered by `sort_order`.

- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "title": "Job Tracker API",
    "subtitle": "Production-oriented REST API",
    "description": "A production-oriented REST API for tracking the full job application lifecycle...",
    "tech_stack": [
      {"name": "Flask", "icon": "fa-flask"},
      {"name": "PostgreSQL", "icon": "fa-database"},
      {"name": "JWT", "icon": "fa-key"}
    ],
    "repo_url": "https://github.com/example/project",
    "live_url": "https://example.com",
    "highlights": "Comprehensive lifecycle status tracking\nStrict user data isolation\nOptimized pagination queries",
    "sort_order": 0,
    "featured": true
  }
]
```

#### `GET /api/skills`

Retrieves all skills grouped by their associated domain categories.

- **Response**: `200 OK`

```json
[
  {
    "domain_id": 1,
    "domain_name": "Backend",
    "sort_order": 0,
    "skills": [
      {
        "id": 1,
        "name": "Python",
        "icon": "python",
        "level": "Core",
        "sort_order": 0
      },
      {
        "id": 2,
        "name": "FastAPI",
        "icon": "fastapi",
        "level": "Core",
        "sort_order": 1
      }
    ]
  }
]
```

#### `GET /api/skill-domains`

Retrieves all skill domain categories ordered by `sort_order`.

- **Response**: `200 OK`

```json
[
  {"id": 1, "name": "Backend", "sort_order": 0},
  {"id": 2, "name": "Databases", "sort_order": 1},
  {"id": 3, "name": "Frontend", "sort_order": 2},
  {"id": 4, "name": "Testing & Delivery", "sort_order": 3},
  {"id": 5, "name": "Engineering Practices", "sort_order": 4}
]
```

#### `GET /api/education`

Retrieves academic education records ordered chronologically by `sort_order`.

- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "qualification": "B.E. Computer Science Engineering",
    "institution": "Dhaanish Ahmed College of Engineering, Chennai",
    "start_year": 2022,
    "end_year": 2026,
    "grade": "CGPA: 8.01 / 10",
    "description": "Core coursework in Data Structures & Algorithms, Database Management Systems, Operating Systems, Computer Networks, and Object-Oriented Software Engineering.",
    "sort_order": 0
  }
]
```

#### `GET /api/contact-links`

Retrieves all enabled contact channels and social destinations.

- **Response**: `200 OK`

```json
[
  {
    "id": 1,
    "platform": "Email",
    "url": "mailto:ibrahimchennai2005@gmail.com",
    "icon": "email",
    "icon_url": null,
    "enabled": true,
    "sort_order": 0
  }
]
```

#### `GET /api/contact-links/{id}/icon`

Streams the custom binary icon stored for a contact link.

---

### 2.4 Visitor Actions & Telemetry

#### `POST /api/contact`

Submits a visitor message from the contact form.

- **Rate Limit**: 5 requests per minute per IP
- **Request Body**:

```json
{
  "name": "Recruiter Name",
  "email": "recruiter@example.com",
  "phone": "+1234567890",
  "subject": "Senior Backend Opportunity",
  "message": "Hello Mohamed, we reviewed your projects and would like to connect."
}
```

- **Response**: `201 Created`

```json
{
  "id": 1,
  "name": "Recruiter Name",
  "email": "recruiter@example.com",
  "subject": "Senior Backend Opportunity",
  "created_at": "2026-09-03T12:00:00Z",
  "is_read": false
}
```

#### `POST /api/analytics/event`

Non-blocking fire-and-forget telemetry beacon for page views and terminal commands. Processed via FastAPI `BackgroundTasks`.

- **Request Body**:

```json
{
  "event_type": "page_view",
  "value": "projects",
  "session_id": "c7a8b410-d8e2-45a1-9457-11f87a892b1a"
}
```

- **Response**: `202 Accepted`

```json
{"status": "recorded"}
```

#### `GET /api/resume`

Streams the resume PDF binary. Serves the stored database binary (`ResumeFile`) if present; otherwise falls back to the static fallback PDF file on disk.

- **Headers**: Includes `Content-Type: application/pdf` and `Content-Disposition: inline; filename="Resume.pdf"`
- **Response**: `200 OK` (binary PDF stream)

#### `HEAD /api/resume`

Liveness probe for the resume document. Returns HTTP headers without response body.

#### `GET /api/source-control`

Queries GitHub repository commit and branch status. Caches responses in memory for 60 seconds to respect GitHub API rate limits.

- **Rate Limit**: 30 requests per minute per IP
- **Response**: `200 OK`

```json
{
  "status": "ok",
  "branch": "main",
  "short_sha": "abc123",
  "commit": {
    "message": "Example commit message",
    "author": "Mohamed Ibrahim Y",
    "relative_date": "recently"
  },
  "stats": {
    "modified": 4,
    "added": 0,
    "deleted": 0,
    "total_files": 4
  },
  "repo_url": "https://github.com/Ibrahim-2005/portfolio"
}
```

#### `GET /health` / `HEAD /health`

Liveness check for hosting platforms and load balancers.

- **Response**: `200 OK`

```json
{"status": "ok"}
```

---

## 3. Authentication

#### `POST /api/auth/login`

Authenticates the administrator using email and password, returning a signed JWT access token.

- **Rate Limit**: 5 requests per minute per IP
- **Request Body**:

```json
{
  "email": "admin@example.com",
  "password": "your-secure-password"
}
```

- **Response**: `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

- **Errors**: `401 Unauthorized` for invalid email or password.

---

## 4. Protected Administration Endpoints (`/api/admin/*`)

All endpoints in this section require the HTTP header:

```
Authorization: Bearer <access_token>
```

Requests missing or with an expired/invalid token receive `401 Unauthorized`.

### 4.1 Admin Identity

#### `GET /api/admin/me`

Returns current authenticated administrator email.

- **Response**: `200 OK` &rarr; `{"email": "admin@example.com"}`

---

### 4.2 Pages CMS

- `PUT /api/admin/pages/{slug}`: Dynamically updates singleton configuration for the given slug (`home`, `about`, `projects`, `skills`, `resume`, `contact`, `settings`). Returns updated configuration.
- `GET /api/admin/pages/readme`: Retrieves raw README configuration.
- `PATCH /api/admin/pages/readme`: Updates README markdown text (`{"content": "# New README..."}`).

---

### 4.3 Sidebar Explorer CMS

- `GET /api/admin/sidebar`: Lists all sidebar items (including hidden items) ordered by `sort_order`.
- `PATCH /api/admin/sidebar/{id}`: Updates sidebar item metadata:

  ```json
  {
    "label": "projects.sql",
    "sort_order": 2,
    "is_visible": true
  }
  ```

- `POST /api/admin/sidebar/{id}/icon`: Uploads custom image icon (PNG, JPEG, WebP &le; 2MB) to Cloudinary.
- `DELETE /api/admin/sidebar/{id}/icon`: Removes custom icon from Cloudinary and clears icon metadata.

---

### 4.4 Projects CMS

- `POST /api/admin/projects`: Creates a new project:

  ```json
  {
    "title": "New System",
    "subtitle": "Microservice Architecture",
    "description": "High-throughput asynchronous event processor...",
    "tech_stack": [{"name": "Python", "icon": "python"}, {"name": "Kafka", "icon": "kafka"}],
    "repo_url": "https://github.com/example/project",
    "live_url": "https://example.com",
    "highlights": "Sub-millisecond processing\nAutomated retry queues",
    "sort_order": 5,
    "featured": true
  }
  ```

  &rarr; `201 Created`
- `PUT /api/admin/projects/{id}`: Updates an existing project record.
- `DELETE /api/admin/projects/{id}`: Deletes a project record. Returns `204 No Content`.

---

### 4.5 Skills & Domains CMS

- `GET /api/admin/skill-domains`: Lists all skill domains.
- `POST /api/admin/skill-domains`: Creates a new domain (`{"name": "Cloud Infrastructure", "sort_order": 5}`).
- `PUT /api/admin/skill-domains/{id}`: Updates domain name and sort order.
- `DELETE /api/admin/skill-domains/{id}`: Deletes domain. Returns `409 Conflict` if skills are still associated with the domain.
- `GET /api/admin/skills`: Lists all individual skills as a flat list.
- `POST /api/admin/skills`: Creates a skill:

  ```json
  {
    "domain_id": 1,
    "name": "Docker",
    "icon": "docker",
    "level": "Core",
    "sort_order": 3
  }
  ```

- `PUT /api/admin/skills/{id}`: Updates an existing skill.
- `DELETE /api/admin/skills/{id}`: Deletes a skill record.

---

### 4.6 Education CMS

- `GET /api/admin/education`: Lists all academic records.
- `POST /api/admin/education`: Creates an education record.
- `PUT /api/admin/education/{id}`: Updates an academic record.
- `DELETE /api/admin/education/{id}`: Deletes an academic record.

---

### 4.7 Contact Links CMS

- `GET /api/admin/contact-links`: Lists all contact destinations (including disabled).
- `POST /api/admin/contact-links`: Creates a new contact link.
- `PUT /api/admin/contact-links/{id}`: Updates a contact link.
- `DELETE /api/admin/contact-links/{id}`: Deletes a contact link.
- `POST /api/admin/contact-links/{id}/icon`: Uploads custom image icon.
- `DELETE /api/admin/contact-links/{id}/icon`: Removes custom icon.

---

### 4.8 Messages Inbox

- `GET /api/admin/messages`: Retrieves visitor contact form submissions ordered by `created_at DESC`. Supports query parameter `?is_read=true|false`.
- `PATCH /api/admin/messages/{id}`: Updates message read state (`{"is_read": true}`).
  - *Note*: Deletion of messages is intentionally omitted in v1.0 to ensure communication records are preserved.

---

### 4.9 Resume Management

#### `POST /api/admin/resume/upload`

Uploads a replacement PDF resume document.

- **Content-Type**: `multipart/form-data`
- **Validation**: File size &le; 5MB, verifies `%PDF` magic bytes and `application/pdf` MIME type.
- **Storage**: Stored directly into the `resume_file` database table as binary data (`BYTEA`), ensuring persistence across container restarts on ephemeral hosting.
- **Response**: `200 OK`

```json
{
  "message": "Resume uploaded successfully",
  "filename": "Resume.pdf",
  "size_bytes": 145020
}
```

---

### 4.10 Analytics Summary

#### `GET /api/admin/analytics/summary`

Aggregates telemetry data for the administrative dashboard:

- Page views grouped by calendar date
- Top 20 most frequently executed terminal commands

- **Response**: `200 OK`

```json
{
  "page_views": [
    {"date": "2026-09-01", "count": 42},
    {"date": "2026-09-02", "count": 68}
  ],
  "top_commands": [
    {"command": "projects", "count": 28},
    {"command": "theme dracula", "count": 19},
    {"command": "skills", "count": 14}
  ]
}
```

---

## 5. Error Responses

PortfolioOS follows standard FastAPI error formatting:

### 5.1 Standard Error Structure

```json
{
  "detail": "Error explanation message"
}
```

### 5.2 Pydantic Validation Errors (`422 Unprocessable Entity`)

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error"
    }
  ]
}
```

### 5.3 Rate Limiting Errors (`429 Too Many Requests`)

When rate limits are exceeded on `/api/contact` or `/api/auth/login`:

```json
{
  "detail": "Rate limit exceeded: 5 per 1 minute"
}
```

### 5.4 Common HTTP Status Codes

| Status Code | Meaning | Typical Trigger |
| --- | --- | --- |
| `200 OK` | Success | Successful read or update operation |
| `201 Created` | Created | Resource successfully created (`POST /api/contact`, etc.) |
| `202 Accepted` | Accepted | Background task queued (`POST /api/analytics/event`) |
| `204 No Content` | Deleted | Resource successfully deleted |
| `400 Bad Request` | Client Error | Malformed payload or invalid PDF upload |
| `401 Unauthorized` | Auth Required | Missing or expired JWT token |
| `404 Not Found` | Not Found | Requested entity ID or slug does not exist |
| `409 Conflict` | Conflict | Deleting a skill domain that still contains skills |
| `422 Unprocessable` | Validation Error | Request body failed Pydantic schema validation |
| `429 Too Many Requests` | Rate Limited | Rate limit threshold exceeded |
| `500 Internal Error` | Server Error | Unhandled backend exception |
