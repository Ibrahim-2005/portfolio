"""
Tests to verify the SQLAlchemy model structure for Phase 3 CMS data models.
"""
import pytest
from sqlalchemy import inspect
from app.models.project import Project
from app.models.skill import Skill
from app.models.skill_domain import SkillDomain
from app.models.message import Message
from app.models.education import Education
from app.models.contact_link import ContactLink
from app.models.home_config import HomeConfig
from app.core.database import engine

def test_models_exist():
    """Verify the Phase 3 tables exist in the metadata."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    assert "projects" in tables
    assert "skills" in tables
    assert "skill_domains" in tables
    assert "messages" in tables
    assert "education" in tables
    assert "contact_links" in tables
    assert "home_config" in tables

def test_project_model_columns():
    """Verify Project featured column exists."""
    mapper = inspect(Project)
    columns = [col.key for col in mapper.columns]
    assert "featured" in columns
    assert "tech_stack" in columns
    assert "title" in columns

def test_message_model_columns():
    """Verify Message phone column exists."""
    mapper = inspect(Message)
    columns = [col.key for col in mapper.columns]
    assert "phone" in columns

def test_skill_domain_relationships():
    """Verify Skill.domain_id references skill_domains.id and SkillDomain.skills relationship exists."""
    # Check Skill columns
    skill_mapper = inspect(Skill)
    skill_cols = [col.key for col in skill_mapper.columns]
    assert "domain_id" in skill_cols
    
    # Check relationships
    skill_domain_mapper = inspect(SkillDomain)
    relationships = [rel.key for rel in skill_domain_mapper.relationships]
    assert "skills" in relationships
    
    # Check foreign key in Skill
    domain_id_col = skill_mapper.columns.domain_id
    foreign_keys = list(domain_id_col.foreign_keys)
    assert len(foreign_keys) > 0
    assert foreign_keys[0].target_fullname == "skill_domains.id"
