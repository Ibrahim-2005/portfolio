"""
app/main.py
───────────
FastAPI application entrypoint.
Creates the app, registers CORS middleware, and includes all routers.
No route logic lives here — just wiring.
"""
import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.limiter import limiter
from app.core.security import _wire_db_dependency, get_current_admin_user


# ── Public routers ────────────────────────────────────────────────────────────
from app.routers.public import analytics as pub_analytics
from app.routers.public import contact as pub_contact
from app.routers.public import guestbook as pub_guestbook
from app.routers.public import projects as pub_projects
from app.routers.public import sections as pub_sections
from app.routers.public import skills as pub_skills
from app.routers.public import pages as pub_pages
from app.routers.public import education as pub_education
from app.routers.public import skill_domains as pub_skill_domains
from app.routers.public import contact_links as pub_contact_links
# ── Admin routers (JWT-protected) ─────────────────────────────────────────────
from app.routers.admin import analytics as adm_analytics

# ── Auth router (public — login endpoint) ─────────────────────────────────────
from app.routers.admin import auth as adm_auth
from app.routers.admin import guestbook as adm_guestbook
from app.routers.admin import messages as adm_messages
from app.routers.admin import projects as adm_projects
from app.routers.admin import sections as adm_sections
from app.routers.admin import skills as adm_skills
from app.routers.admin import pages as adm_pages
from app.routers.admin import education as adm_education
from app.routers.admin import skill_domains as adm_skill_domains
from app.routers.admin import contact_links as adm_contact_links

# ── Public routers ────────────────────────────────────────────────────────────
from app.routers.public import analytics as pub_analytics
from app.routers.public import contact as pub_contact
from app.routers.public import guestbook as pub_guestbook
from app.routers.public import projects as pub_projects
from app.routers.public import resume as pub_resume
from app.routers.public import sections as pub_sections
from app.routers.public import skills as pub_skills

# ── Wire the DB dependency into get_current_admin_user ────────────────────────
_wire_db_dependency()

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PortfolioOS API",
    description="Backend for the VS Code-styled portfolio site.",
    version="0.1.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route registration ────────────────────────────────────────────────────────
# Public (unauthenticated) — /api/...
_PUBLIC_PREFIX = "/api"
app.include_router(pub_sections.router, prefix=_PUBLIC_PREFIX)
app.include_router(pub_projects.router, prefix=_PUBLIC_PREFIX)
app.include_router(pub_skills.router, prefix=_PUBLIC_PREFIX)
app.include_router(pub_contact.router, prefix=_PUBLIC_PREFIX)
app.include_router(pub_guestbook.router, prefix=_PUBLIC_PREFIX)
app.include_router(pub_analytics.router, prefix=_PUBLIC_PREFIX)

app.include_router(pub_pages.router, prefix=_PUBLIC_PREFIX)
app.include_router(pub_education.router, prefix=_PUBLIC_PREFIX)
app.include_router(pub_skill_domains.router, prefix=_PUBLIC_PREFIX)
app.include_router(pub_contact_links.router, prefix=_PUBLIC_PREFIX)

app.include_router(pub_resume.router, prefix=_PUBLIC_PREFIX)


# Auth — /api/auth/login (public, no JWT required)
app.include_router(adm_auth.router, prefix=_PUBLIC_PREFIX)

# Admin (JWT-protected) — /api/admin/...
_ADMIN_PREFIX = "/api/admin"
_admin_deps = [Depends(get_current_admin_user)]
app.include_router(adm_sections.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)
app.include_router(adm_projects.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)
app.include_router(adm_skills.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)
app.include_router(adm_messages.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)
app.include_router(adm_guestbook.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)
app.include_router(adm_analytics.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)
app.include_router(adm_pages.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)
app.include_router(adm_education.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)
app.include_router(adm_skill_domains.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)
app.include_router(adm_contact_links.router, prefix=_ADMIN_PREFIX, dependencies=_admin_deps)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
def health() -> dict:
    """Simple liveness probe — returns 200 OK if the app is running."""
    return {"status": "ok"}


@app.head("/health", tags=["health"])
def health_head():
    """Simple liveness probe — returns 200 OK if the app is running."""
    return {"status": "ok"}


# ── Admin identity endpoint ───────────────────────────────────────────────────
@app.get("/api/admin/me", tags=["admin:auth"])
def admin_me(admin=Depends(get_current_admin_user)):
    """Return the current admin's email. Protected by JWT."""
    return {"email": admin.email}


# ── Mount Frontend (StaticFiles) ──────────────────────────────────────────────
# Mount the frontend directory. This MUST be the last route registered so API routes take precedence.
frontend_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
