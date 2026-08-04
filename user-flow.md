# User Flow — PortfolioOS

For per-persona navigation flows (first-time visitor, technical visitor, admin), see `UIUX-spec.md` §7. This document covers the site map and the end-to-end data flows behind key interactions.

## 1. Site Map

```mermaid
flowchart TD
    Home["Home"]
    About["About Me"]
    Bio["Bio"]
    Edu["Education"]
    Projects["Projects"]
    P1["Job Tracker API"]
    P2["Money Tracker"]
    P3["Curated by Afza"]
    P4["Awaken Your Inner Power"]
    Skills["Skills"]
    Readme["README"]
    Files["Files"]
    Resume["Resume (PDF + inline)"]
    Certs["Certificates"]
    Contact["Contact"]
    Admin["Admin (hidden, JWT-gated)"]
    Dashboard["Dashboard"]
    Editor["Content Editor"]
    Inbox["Messages Inbox"]
    Guestbook["Guestbook Moderation"]
    AnalyticsView["Analytics"]

    Home --> About --> Bio
    About --> Edu
    Home --> Projects
    Projects --> P1
    Projects --> P2
    Projects --> P3
    Projects --> P4
    Home --> Skills
    Home --> Readme
    Home --> Files
    Files --> Resume
    Files --> Certs
    Home --> Contact

    Admin --> Dashboard
    Dashboard --> Editor
    Dashboard --> Inbox
    Dashboard --> Guestbook
    Dashboard --> AnalyticsView
```

## 2. End-to-End Flow: Contact Form Submission

```mermaid
sequenceDiagram
    participant V as Visitor
    participant F as Frontend
    participant A as FastAPI API
    participant D as PostgreSQL

    V->>F: Fills contact form, clicks Send
    F->>A: POST /api/contact {name, email, message}
    A->>A: Validate via Pydantic schema
    A->>D: INSERT into messages
    D-->>A: Success
    A-->>F: 201 Created
    F-->>V: Shows confirmation
    Note over A,D: Later — Ibrahim logs into /admin
    A->>D: SELECT unread messages
    D-->>A: Message list
    A-->>V: (via Admin UI) Ibrahim reads/replies externally
```

## 3. End-to-End Flow: Admin Adds a New Sidebar Section

```mermaid
sequenceDiagram
    participant I as Ibrahim (Admin)
    participant AU as Admin UI
    participant A as FastAPI API
    participant D as PostgreSQL
    participant P as Public Site

    I->>AU: Logs in (/admin)
    AU->>A: POST /api/auth/login
    A-->>AU: JWT token
    I->>AU: Creates new section (title, slug, icon, content)
    AU->>A: POST /api/admin/sections (Authorization: Bearer JWT)
    A->>A: Verify JWT
    A->>D: INSERT into sections
    D-->>A: Success
    A-->>AU: 201 Created
    Note over P: Next visitor load
    P->>A: GET /api/sections
    A->>D: SELECT * from sections
    D-->>A: Includes new section
    A-->>P: Sidebar now shows new entry — no redeploy needed
```

## 4. End-to-End Flow: Terminal Command Analytics

```mermaid
sequenceDiagram
    participant V as Visitor
    participant T as Terminal Panel
    participant A as FastAPI API
    participant D as PostgreSQL

    V->>T: Types a command (e.g. "projects")
    T->>T: Parses + executes command locally
    T->>A: POST /api/analytics/event {type: "command", value: "projects", session_id}
    A->>D: INSERT into analytics_events
    Note over I: Later, in Admin Analytics view
    A->>D: SELECT command counts grouped by value
    D-->>A: Aggregated counts
    A-->>I: "Top commands" chart
```
