from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.about_config import AboutConfig
from app.models.certificates_config import CertificatesConfig
from app.models.contact_config import ContactConfig
from app.models.home_config import HomeConfig
from app.models.projects_config import ProjectsConfig
from app.models.public_settings import PublicSettings
from app.models.readme_config import ReadmeConfig
from app.models.resume_config import ResumeConfig
from app.models.skills_config import SkillsConfig
from app.schemas.about_config import AboutConfigOut, AboutConfigUpdate
from app.schemas.certificates_config import (
    CertificatesConfigOut,
    CertificatesConfigUpdate,
)
from app.schemas.contact_config import ContactConfigOut, ContactConfigUpdate
from app.schemas.home_config import HomeConfigOut, HomeConfigUpdate
from app.schemas.projects_config import ProjectsConfigOut, ProjectsConfigUpdate
from app.schemas.public_settings import PublicSettingsOut, PublicSettingsUpdate
from app.schemas.readme_config import ReadmeConfigOut, ReadmeConfigUpdate
from app.schemas.resume_config import ResumeConfigOut, ResumeConfigUpdate
from app.schemas.skills_config import SkillsConfigOut, SkillsConfigUpdate

PAGE_MAPPING = {
    "home": {
        "model": HomeConfig,
        "out_schema": HomeConfigOut,
        "update_schema": HomeConfigUpdate,
    },
    "about": {
        "model": AboutConfig,
        "out_schema": AboutConfigOut,
        "update_schema": AboutConfigUpdate,
    },
    "projects": {
        "model": ProjectsConfig,
        "out_schema": ProjectsConfigOut,
        "update_schema": ProjectsConfigUpdate,
    },
    "skills": {
        "model": SkillsConfig,
        "out_schema": SkillsConfigOut,
        "update_schema": SkillsConfigUpdate,
    },
    "resume": {
        "model": ResumeConfig,
        "out_schema": ResumeConfigOut,
        "update_schema": ResumeConfigUpdate,
    },
    "contact": {
        "model": ContactConfig,
        "out_schema": ContactConfigOut,
        "update_schema": ContactConfigUpdate,
    },
    "settings": {
        "model": PublicSettings,
        "out_schema": PublicSettingsOut,
        "update_schema": PublicSettingsUpdate,
    },
    "readme": {
        "model": ReadmeConfig,
        "out_schema": ReadmeConfigOut,
        "update_schema": ReadmeConfigUpdate,
    },
    "certificates": {
        "model": CertificatesConfig,
        "out_schema": CertificatesConfigOut,
        "update_schema": CertificatesConfigUpdate,
    },
}

def get_page_config(db: Session, slug: str):
    mapping = PAGE_MAPPING.get(slug)
    if not mapping:
        raise HTTPException(status_code=404, detail="Page configuration not found")
        
    model = mapping["model"]
    # Singletons operate strictly on id=1
    instance = db.get(model, 1)
    if not instance:
        raise HTTPException(status_code=404, detail=f"Configuration for '{slug}' not found")
        
    return instance

def get_page_schema(slug: str):
    mapping = PAGE_MAPPING.get(slug)
    if not mapping:
        raise HTTPException(status_code=404, detail="Page configuration not found")
    return mapping["out_schema"]

def get_update_schema(slug: str):
    mapping = PAGE_MAPPING.get(slug)
    if not mapping:
        raise HTTPException(status_code=404, detail="Page configuration not found")
    return mapping["update_schema"]

def update_page_config(db: Session, slug: str, update_data):
    mapping = PAGE_MAPPING.get(slug)
    if not mapping:
        raise HTTPException(status_code=404, detail="Page configuration not found")
        
    model = mapping["model"]
    instance = db.get(model, 1)
    
    if not instance:
        # Create singleton if missing
        instance = model(id=1)
        db.add(instance)
        
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(instance, key, value)
        
    db.commit()
    db.refresh(instance)
    return instance
