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

from app.models.home_config import HomeConfig
from app.models.about_config import AboutConfig
from app.models.projects_config import ProjectsConfig
from app.models.skills_config import SkillsConfig
from app.models.resume_config import ResumeConfig
from app.models.contact_config import ContactConfig
from app.models.public_settings import PublicSettings

__all__ = [
    "AdminUser",
    "AnalyticsEvent",
    "GuestbookEntry",
    "Message",
    "Project",
    "Section",
    "Skill",
    "HomeConfig",
    "AboutConfig",
    "ProjectsConfig",
    "SkillsConfig",
    "ResumeConfig",
    "ContactConfig",
    "PublicSettings",
]
