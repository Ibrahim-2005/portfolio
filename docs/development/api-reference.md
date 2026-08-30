# API Reference — PortfolioOS

Base URL: `/api`

## Public Endpoints

### `GET /sidebar`
Returns all enabled sidebar file and folder items ordered by `sort_order`.
```json
[
  {
    "id": 1,
    "slug": "home",
    "label": "home.py",
    "icon": "python",
    "has_icon": true,
    "icon_url": null,
    "extension": ".py",
    "sort_order": 1,
    "enabled": true
  }
]
```

### `GET /pages/{slug}`
Returns page configuration and metadata for singleton pages (`home`, `about`, `contact`, `readme`, `certificates`, `settings`).
```json
{
  "slug": "home",
  "top_text": "// main.py",
  "name": "Mohamed Ibrahim Y",
  "tagline": "Building real, working software 🚀",
  "roles": [{"label": "Full Stack Developer", "sort_order": 1}],
  "social_links": [{"platform": "GitHub", "url": "https://github.com/...", "sort_order": 1}]
}
```

### `GET /projects`
Returns all featured projects, ordered by `sort_order`.
```json
[
  {
    "id": 1,
    "title": "PortfolioOS",
    "description": "Interactive VS Code-styled developer portfolio OS.",
    "tech_stack": ["FastAPI", "SQLAlchemy", "Vanilla JS", "CSS3"],
    "repo_url": "https://github.com/Ibrahim-2005/portfolio",
    "live_url": "https://ibrahim.dev",
    "highlights": ["13 Themes", "Live terminal emulator"],
    "sort_order": 1
  }
]
```

### `GET /skills`
Returns skills grouped by category or flat list.
```json
[
  {
    "id": 1,
    "name": "Python",
    "domain_id": 1,
    "level": "core",
    "sort_order": 1
  }
]
```

### `GET /skill-domains`
Returns skill domain categories with their associated skills.
```json
[
  {
    "id": 1,
    "name": "Backend",
    "slug": "backend",
    "sort_order": 1,
    "skills": [{"id": 1, "name": "FastAPI", "level": "core"}]
  }
]
```

### `GET /education`
Returns education history ordered chronologically.
```json
[
  {
    "id": 1,
    "institution": "Anna University",
    "qualification": "B.Tech Information Technology",
    "start_year": "2022",
    "end_year": "2026",
    "description": "Coursework in Algorithms, Distributed Systems, Database Management.",
    "sort_order": 1
  }
]
```

### `GET /contact-links`
Returns configured social and contact channels.
```json
[
  {
    "id": 1,
    "platform": "GitHub",
    "url": "https://github.com/Ibrahim-2005",
    "icon": "github",
    "enabled": true,
    "sort_order": 1
  }
]
```

### `GET /contact-links/{id}/icon`
Serves the uploaded custom binary icon for a specific contact link.

### `POST /contact`
Body: `{"name": "...", "email": "...", "phone": "...", "subject": "...", "message": "..."}`
→ `201 Created` on success. Rate-limited to 5 submissions per minute via SlowAPI.

### `POST /guestbook`
Body: `{"name": "...", "message": "..."}`
→ `201 Created`. Entry stored with `is_approved: false` until admin approval.

### `POST /analytics/event`
Body: `{"event_type": "page_view" | "command", "value": "string", "session_id": "string"}`
→ `202 Accepted`. Fire-and-forget telemetry event.

### `GET /resume`
Returns resume status and preview metadata.

### `GET /resume/download`
Serves the resume PDF binary with appropriate `Content-Disposition`.

### `GET /source-control`
Returns latest GitHub commit status, active branch, and modified file counts.

---

## Authentication

### `POST /auth/login`
Body: `{"email": "admin@example.com", "password": "secretpassword"}`
→ `{"access_token": "<jwt>", "token_type": "bearer"}`

---

## Admin Endpoints (require `Authorization: Bearer <JWT>`)

### Admin Identity
- `GET /admin/me` — Returns authenticated admin user info (`{"email": "admin@example.com"}`)

### Pages & CMS
- `GET /admin/pages/{slug}` — Read raw page configuration
- `PUT /admin/pages/{slug}` — Update page CMS configuration

### Sidebar Management
- `GET /admin/sidebar`, `POST /admin/sidebar`, `PUT /admin/sidebar/{id}`, `DELETE /admin/sidebar/{id}`

### Projects
- `GET /admin/projects`, `POST /admin/projects`, `PUT /admin/projects/{id}`, `DELETE /admin/projects/{id}`

### Skills & Domains
- `GET /admin/skill-domains`, `POST /admin/skill-domains`, `PUT /admin/skill-domains/{id}`, `DELETE /admin/skill-domains/{id}`
- `GET /admin/skills`, `POST /admin/skills`, `PUT /admin/skills/{id}`, `DELETE /admin/skills/{id}`

### Education
- `GET /admin/education`, `POST /admin/education`, `PUT /admin/education/{id}`, `DELETE /admin/education/{id}`

### Contact Links & Messages
- `GET /admin/contact-links`, `POST /admin/contact-links`, `PUT /admin/contact-links/{id}`, `DELETE /admin/contact-links/{id}`
- `POST /admin/contact-links/{id}/icon` — Upload binary icon
- `GET /admin/messages` — List contact submissions
- `PATCH /admin/messages/{id}` — Mark read/unread

### Guestbook & Analytics
- `GET /admin/guestbook`, `PATCH /admin/guestbook/{id}`, `DELETE /admin/guestbook/{id}`
- `GET /admin/analytics/summary` — Page views, top terminal commands, user sessions

### Resume Management
- `POST /admin/resume/upload` — Upload new resume PDF

---

## Error Format (consistent across all endpoints)
```json
{"detail": "Human-readable error message"}
```
Standard HTTP status codes: `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `422` Validation Error, `429` Rate Limited.
