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

from app.models.home_config import HomeConfig
from app.models.about_config import AboutConfig
from app.models.projects_config import ProjectsConfig
from app.models.skills_config import SkillsConfig
from app.models.resume_config import ResumeConfig
from app.models.contact_config import ContactConfig
from app.models.public_settings import PublicSettings

from app.models.education import Education
from app.models.skill_domain import SkillDomain
from app.models.contact_link import ContactLink
from app.models.readme_config import ReadmeConfig
from app.models.certificates_config import CertificatesConfig

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
    "Education",
    "SkillDomain",
    "ContactLink",
    "ReadmeConfig",
    "CertificatesConfig",
]
