"""
app/models/__init__.py
──────────────────────
Import every model here so that Alembic's env.py picks up all table metadata
when it calls `Base.metadata` — without this barrel import, autogenerate misses tables.
"""
from app.models.admin_user import AdminUser
from app.models.analytics import AnalyticsEvent
from app.models.guestbook import GuestbookEntry
from app.models.message import Message
from app.models.project import Project
from app.models.section import Section
from app.models.skill import Skill

__all__ = [
    "AdminUser",
    "AnalyticsEvent",
    "GuestbookEntry",
    "Message",
    "Project",
    "Section",
    "Skill",
]
