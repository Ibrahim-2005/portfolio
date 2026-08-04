"""
tests/test_seed.py
──────────────────
Tests for the database seed script to ensure it is idempotent.
"""
import pytest
from sqlalchemy.orm import Session

from seed import seed_sections, seed_projects, seed_skills
from app.models.section import Section
from app.models.project import Project
from app.models.skill import Skill

def test_seed_idempotent(db_session: Session):
    # First run
    seed_sections(db_session)
    seed_projects(db_session)
    seed_skills(db_session)

    count_sections_1 = db_session.query(Section).count()
    count_projects_1 = db_session.query(Project).count()
    count_skills_1 = db_session.query(Skill).count()

    assert count_sections_1 > 0
    assert count_projects_1 > 0
    assert count_skills_1 > 0

    # Second run - should skip and not duplicate
    seed_sections(db_session)
    seed_projects(db_session)
    seed_skills(db_session)

    count_sections_2 = db_session.query(Section).count()
    count_projects_2 = db_session.query(Project).count()
    count_skills_2 = db_session.query(Skill).count()

    assert count_sections_1 == count_sections_2
    assert count_projects_1 == count_projects_2
    assert count_skills_1 == count_skills_2
