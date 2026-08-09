"""
Tests for Phase 3 singleton configuration models and schemas.
"""
import pytest
from pydantic import ValidationError

from app.schemas.home_config import HomeConfigOut, HomeConfigUpdate
from app.schemas.about_config import AboutConfigOut, AboutConfigUpdate
from app.schemas.projects_config import ProjectsConfigOut, ProjectsConfigUpdate
from app.schemas.skills_config import SkillsConfigOut, SkillsConfigUpdate
from app.schemas.resume_config import ResumeConfigOut, ResumeConfigUpdate
from app.schemas.contact_config import ContactConfigOut, ContactConfigUpdate
from app.schemas.public_settings import PublicSettingsOut, PublicSettingsUpdate

from app.models.home_config import HomeConfig
from app.models.about_config import AboutConfig
from app.models.projects_config import ProjectsConfig
from app.models.skills_config import SkillsConfig
from app.models.resume_config import ResumeConfig
from app.models.contact_config import ContactConfig
from app.models.public_settings import PublicSettings


def test_models_instantiation():
    """1. Each seven singleton model can be instantiated correctly."""
    home = HomeConfig(id=1, top_text="Hello")
    assert home.top_text == "Hello"
    
    about = AboutConfig(id=1, top_text="About")
    assert about.top_text == "About"
    
    projects = ProjectsConfig(id=1, top_text="Projects")
    assert projects.top_text == "Projects"
    
    skills = SkillsConfig(id=1, top_text="Skills")
    assert skills.top_text == "Skills"
    
    resume = ResumeConfig(id=1, top_text="Resume", file_path="/some/path.pdf")
    assert resume.file_path == "/some/path.pdf"
    
    contact = ContactConfig(id=1, top_text="Contact")
    assert contact.top_text == "Contact"
    
    settings = PublicSettings(id=1, tech_stack_text="React")
    assert settings.tech_stack_text == "React"


def test_home_config_schema():
    """Test Home schema, fixed actions, and social links."""
    # 5. Home contains exactly the three fixed action label fields.
    # 6. No generic actions[] field exists.
    data = {
        "id": 1,
        "action_projects_label": "View Projects",
        "action_about_label": "About Me",
        "action_contact_label": "Contact Me",
        "roles": [
            {"label": "Backend Dev", "icon": "fa-server"}
        ],
        "social_links": [
            {
                "platform": "GitHub",
                "url": "https://github.com",
                "icon": "fa-github",
                "enabled": True,
                "sort_order": 1
            }
        ]
    }
    
    schema = HomeConfigOut(**data)
    assert schema.action_projects_label == "View Projects"
    assert not hasattr(schema, "actions")  # Ensure no generic actions field
    
    # 9. Home social links validate platform/url/icon/enabled/sort_order.
    assert schema.social_links[0].platform == "GitHub"
    
    # 4. Invalid nested structures are rejected.
    invalid_data = data.copy()
    invalid_data["social_links"] = [{"platform": "OnlyPlatform"}]
    with pytest.raises(ValidationError):
        HomeConfigOut(**invalid_data)


def test_about_config_schema():
    """8. About Focus/Learning structures validate emoji + text."""
    data = {
        "id": 1,
        "current_focus": [
            {"emoji": "🚀", "text": "Building things"}
        ],
        "currently_learning": [
            {"emoji": "🧠", "text": "Rust"}
        ]
    }
    
    schema = AboutConfigOut(**data)
    assert schema.current_focus[0].emoji == "🚀"
    
    # Invalid missing text
    invalid_data = data.copy()
    invalid_data["current_focus"] = [{"emoji": "🚀"}]
    with pytest.raises(ValidationError):
        AboutConfigOut(**invalid_data)


def test_public_settings_schema():
    """7. Themes are not part of Public Settings."""
    data = {
        "id": 1,
        "tech_stack_text": "Python",
        "author_text": "Ibrahim"
    }
    
    schema = PublicSettingsOut(**data)
    assert not hasattr(schema, "theme")
    assert not hasattr(schema, "themes")
