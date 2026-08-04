# API Reference — PortfolioOS

Base URL: `/api`

## Public Endpoints

### `GET /sections`
Returns the full sidebar tree (folders + files, ordered).
```json
[
  {
    "id": 1, "slug": "about-me", "title": "About Me", "icon": "folder",
    "type": "folder", "parent_id": null, "sort_order": 1,
    "children": [
      {"id": 2, "slug": "bio", "title": "Bio", "type": "page", "parent_id": 1, "sort_order": 1},
      {"id": 3, "slug": "education", "title": "Education", "type": "page", "parent_id": 1, "sort_order": 2}
    ]
  }
]
```

### `GET /sections/{slug}`
Returns full content for one section.
```json
{"slug": "bio", "title": "Bio", "content": "markdown or structured JSON here"}
```

### `GET /projects`
Returns all featured projects, ordered.
```json
[
  {
    "id": 1, "title": "Job Tracker API", "description": "...",
    "tech_stack": ["Flask", "PostgreSQL", "JWT"],
    "repo_url": "...", "live_url": "...", "highlights": ["..."]
  }
]
```

### `GET /skills`
Returns skills grouped by category.
```json
[{"category": "Backend", "items": [{"name": "Python", "proficiency": "Advanced"}]}]
```

### `POST /contact`
Body: `{"name": "...", "email": "...", "message": "..."}`
→ `201 Created` on success. Validated via Pydantic; rate-limited.

### `POST /guestbook`
Body: `{"name": "...", "message": "..."}`
→ `201 Created`. Entry stored with `is_approved: false` until admin approves.

### `POST /analytics/event`
Body: `{"event_type": "page_view" | "command", "value": "string", "session_id": "string"}`
→ `202 Accepted`. Fire-and-forget, no auth required.

## Auth

### `POST /auth/login`
Body: `{"email": "...", "password": "..."}`
→ `{"access_token": "...", "token_type": "bearer"}`

## Admin Endpoints (require `Authorization: Bearer <JWT>`)

### Sections
- `POST /admin/sections` — create new section (supports adding new sidebar entries)
- `PUT /admin/sections/{id}` — update existing section content/metadata
- `DELETE /admin/sections/{id}` — remove a section

### Projects
- `POST /admin/projects`, `PUT /admin/projects/{id}`, `DELETE /admin/projects/{id}`

### Skills
- `POST /admin/skills`, `PUT /admin/skills/{id}`, `DELETE /admin/skills/{id}`

### Messages
- `GET /admin/messages` — list all, filterable by `is_read`
- `PATCH /admin/messages/{id}` — mark read

### Guestbook
- `GET /admin/guestbook` — list all, filterable by `is_approved`
- `PATCH /admin/guestbook/{id}` — approve/reject

### Analytics
- `GET /admin/analytics/summary` — page views over time, top terminal commands

## Error Format (consistent across all endpoints)
```json
{"detail": "Human-readable error message"}
```
Standard HTTP status codes: `400` validation, `401` unauthenticated, `403` unauthorized, `404` not found, `429` rate-limited.
