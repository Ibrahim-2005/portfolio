"""
app/models/__init__.py
──────────────────────
Import every model here so that Alembic's env.py picks up all table metadata
when it calls `Base.metadata` — without this barrel import, autogenerate misses tables.
"""
from app.models.about_config import AboutConfig
from app.models.admin_user import AdminUser
from app.models.analytics import AnalyticsEvent
from app.models.certificates_config import CertificatesConfig
from app.models.contact_config import ContactConfig
from app.models.contact_link import ContactLink
from app.models.education import Education
from app.models.guestbook import GuestbookEntry
from app.models.home_config import HomeConfig
from app.models.message import Message
from app.models.project import Project
from app.models.projects_config import ProjectsConfig
from app.models.public_settings import PublicSettings
from app.models.readme_config import ReadmeConfig
from app.models.resume_config import ResumeConfig
from app.models.resume_file import ResumeFile
from app.models.skill import Skill
from app.models.skill_domain import SkillDomain
from app.models.skills_config import SkillsConfig

__all__ = [
    "AboutConfig",
    "AdminUser",
    "AnalyticsEvent",
    "CertificatesConfig",
    "ContactConfig",
    "ContactLink",
    "Education",
    "GuestbookEntry",
    "HomeConfig",
    "Message",
    "Project",
    "ProjectsConfig",
    "PublicSettings",
    "ReadmeConfig",
    "ResumeConfig",
    "ResumeFile",
    "Skill",
    "SkillDomain",
    "SkillsConfig",
]
