"""
tests/test_seed.py
──────────────────
Tests for the database seed script to ensure it is idempotent.
"""
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.skill import Skill
from seed import seed_projects, seed_skills


def test_seed_idempotent(db_session: Session):
    # First run
    seed_projects(db_session)
    seed_skills(db_session)


    count_projects_1 = db_session.query(Project).count()
    count_skills_1 = db_session.query(Skill).count()


    assert count_projects_1 > 0
    assert count_skills_1 > 0

    # Second run - should skip and not duplicate
    seed_projects(db_session)
    seed_skills(db_session)


    count_projects_2 = db_session.query(Project).count()
    count_skills_2 = db_session.query(Skill).count()


    assert count_projects_1 == count_projects_2
    assert count_skills_1 == count_skills_2

from app.models.home_config import HomeConfig
from app.models.about_config import AboutConfig
from app.models.projects_config import ProjectsConfig
from app.models.skills_config import SkillsConfig
from app.models.resume_config import ResumeConfig
from app.models.contact_config import ContactConfig
from app.models.public_settings import PublicSettings
from app.models.readme_config import ReadmeConfig
from app.models.certificates_config import CertificatesConfig
from seed import seed_singletons

def test_seed_singletons_idempotent(db_session: Session):
    seed_singletons(db_session)

    models = [HomeConfig, AboutConfig, ProjectsConfig, SkillsConfig, ResumeConfig, ContactConfig, PublicSettings, ReadmeConfig, CertificatesConfig]

    for model in models:
        assert db_session.query(model).count() == 1
        assert db_session.query(model).filter(model.id == 1).first() is not None

    seed_singletons(db_session)

    for model in models:
        assert db_session.query(model).count() == 1

def test_seed_singletons_preserves_existing(db_session: Session):
    # Pre-seed custom value
    custom_home = HomeConfig(
        id=1,
        top_text="Custom top text",
        name="Custom Name",
        tagline="Custom Tagline",
        intro="Custom Intro",
        roles=[],
        social_links=[]
    )
    db_session.add(custom_home)
    db_session.commit()

    seed_singletons(db_session)

    home = db_session.query(HomeConfig).filter(HomeConfig.id == 1).first()
    assert home.top_text == "Custom top text"
    assert home.name == "Custom Name"
