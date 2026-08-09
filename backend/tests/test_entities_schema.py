"""
Tests for Phase 3 entity models and schemas (Task 3.2).
"""
import pytest
from pydantic import ValidationError

from app.schemas.education import EducationOut, EducationCreate
from app.schemas.skill_domain import SkillDomainOut, SkillDomainCreate
from app.schemas.contact_link import ContactLinkOut, ContactLinkCreate
from app.schemas.project import ProjectOut, ProjectCreate
from app.schemas.skill import SkillOut, SkillCreate
from app.schemas.message import MessageCreate, MessageAdminOut


def test_education_schema():
    """Test Education schema validation (required fields, nullable end_year/grade/desc)."""
    # Valid
    data = {
        "id": 1,
        "qualification": "B.E.",
        "institution": "University",
        "start_year": 2020,
        "end_year": None,
        "grade": None,
        "description": None,
        "sort_order": 1
    }
    edu = EducationOut(**data)
    assert edu.qualification == "B.E."
    assert edu.end_year is None

    # Invalid - missing qualification
    with pytest.raises(ValidationError):
        EducationOut(id=1, institution="U", start_year=2020, sort_order=1)


def test_skill_domain_schema():
    """Test SkillDomain schema."""
    data = {"id": 1, "name": "Backend", "sort_order": 0}
    domain = SkillDomainOut(**data)
    assert domain.name == "Backend"

    with pytest.raises(ValidationError):
        SkillDomainOut(id=1, sort_order=0)


def test_contact_link_schema():
    """Test ContactLink schema."""
    data = {
        "id": 1,
        "platform": "GitHub",
        "url": "https://github.com",
        "icon": None,
        "enabled": True,
        "sort_order": 0
    }
    link = ContactLinkOut(**data)
    assert link.enabled is True
    assert link.icon is None

    # Check default enabled in create
    create = ContactLinkCreate(platform="LinkedIn", url="https://link")
    assert create.enabled is True


def test_project_schema():
    """Test Project typed tech_stack and featured fields."""
    data = {
        "id": 1,
        "title": "Project",
        "description": "Desc",
        "tech_stack": [
            {"name": "Python", "icon": "python-icon"},
            {"name": "FastAPI", "icon": None}
        ],
        "sort_order": 0,
        "featured": True
    }
    proj = ProjectOut(**data)
    assert proj.tech_stack[0].name == "Python"
    assert proj.tech_stack[0].icon == "python-icon"
    assert proj.tech_stack[1].name == "FastAPI"
    assert proj.tech_stack[1].icon is None
    assert proj.featured is True
    assert not hasattr(proj, "tech_stack_legacy")

    # Reject untyped dicts or missing names
    with pytest.raises(ValidationError):
        bad_data = data.copy()
        bad_data["tech_stack"] = [{"missing_name": "True"}]
        ProjectOut(**bad_data)


def test_skill_schema():
    """Test Skill domain_id, icon, and 0-100 proficiency."""
    data = {
        "id": 1,
        "name": "Python",
        "category": "Backend",
        "domain_id": 2,
        "icon": "python-icon",
        "proficiency": 80,
        "sort_order": 1
    }
    skill = SkillOut(**data)
    assert skill.domain_id == 2
    assert skill.proficiency == 80
    assert skill.category == "Backend"

    # Test proficiency limits
    with pytest.raises(ValidationError):
        SkillOut(**{**data, "proficiency": -1})
        
    with pytest.raises(ValidationError):
        SkillOut(**{**data, "proficiency": 101})


def test_message_schema():
    """Test Message schema phone field behavior."""
    # Existing behavior without phone remains valid
    data = {
        "name": "John",
        "email": "test@test.com",
        "message": "Hello world message"
    }
    msg_create = MessageCreate(**data)
    assert msg_create.phone is None

    # Phone is accepted
    data_phone = {**data, "phone": "+1234567890"}
    msg_phone = MessageCreate(**data_phone)
    assert msg_phone.phone == "+1234567890"

    # Phone respects max length
    with pytest.raises(ValidationError):
        MessageCreate(**{**data, "phone": "1" * 51})
