"""
app/models/__init__.py
──────────────────────
Import every model here so that Alembic's env.py picks up all table metadata
when it calls `Base.metadata` — without this barrel import, autogenerate misses tables.
"""
from app.models.admin_user import AdminUser  # noqa: F401
from app.models.analytics import AnalyticsEvent  # noqa: F401
from app.models.guestbook import GuestbookEntry  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.section import Section  # noqa: F401
from app.models.skill import Skill  # noqa: F401

__all__ = [
    "AdminUser",
    "AnalyticsEvent",
    "GuestbookEntry",
    "Message",
    "Project",
    "Section",
    "Skill",
]
