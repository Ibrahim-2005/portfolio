"""
app/main.py
───────────
FastAPI application entrypoint.
Creates the app, registers CORS middleware, and includes all routers.
No route logic lives here — just wiring.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# ── Public routers ────────────────────────────────────────────────────────────
from app.routers.public import analytics as pub_analytics
from app.routers.public import contact as pub_contact
from app.routers.public import guestbook as pub_guestbook
from app.routers.public import projects as pub_projects
from app.routers.public import sections as pub_sections
from app.routers.public import skills as pub_skills

# ── Admin routers ─────────────────────────────────────────────────────────────
from app.routers.admin import analytics as adm_analytics
from app.routers.admin import auth as adm_auth
from app.routers.admin import guestbook as adm_guestbook
from app.routers.admin import messages as adm_messages
from app.routers.admin import projects as adm_projects
from app.routers.admin import sections as adm_sections
from app.routers.admin import skills as adm_skills

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PortfolioOS API",
    description="Backend for the VS Code-styled portfolio site.",
    version="0.1.0",
)

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

# Admin (JWT-protected) — /api/admin/...
_ADMIN_PREFIX = "/api/admin"
app.include_router(adm_auth.router, prefix=_ADMIN_PREFIX)
app.include_router(adm_sections.router, prefix=_ADMIN_PREFIX)
app.include_router(adm_projects.router, prefix=_ADMIN_PREFIX)
app.include_router(adm_skills.router, prefix=_ADMIN_PREFIX)
app.include_router(adm_messages.router, prefix=_ADMIN_PREFIX)
app.include_router(adm_guestbook.router, prefix=_ADMIN_PREFIX)
app.include_router(adm_analytics.router, prefix=_ADMIN_PREFIX)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
def health() -> dict:
    """Simple liveness probe — returns 200 OK if the app is running."""
    return {"status": "ok"}
