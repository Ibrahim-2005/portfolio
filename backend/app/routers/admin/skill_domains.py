"""
app/routers/admin/skill_domains.py
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.skill_domain import (
    SkillDomainCreate,
    SkillDomainOut,
    SkillDomainUpdate,
)
from app.services import skill_domain_service

router = APIRouter(
    prefix="/skill-domains",
    tags=["Admin Skill Domains"],
)

@router.get("", response_model=list[SkillDomainOut])
def get_skill_domains(db: Session = Depends(get_db)):
    """Retrieve all skill domains."""
    return skill_domain_service.get_all(db)

@router.post("", response_model=SkillDomainOut, status_code=status.HTTP_201_CREATED)
def create_skill_domain(domain_in: SkillDomainCreate, db: Session = Depends(get_db)):
    """Create a new skill domain."""
    return skill_domain_service.create(db, domain_in)

@router.put("/{domain_id}", response_model=SkillDomainOut)
def update_skill_domain(domain_id: int, domain_in: SkillDomainUpdate, db: Session = Depends(get_db)):
    """Update an existing skill domain."""
    db_obj = skill_domain_service.get_by_id(db, domain_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Skill domain not found")
    return skill_domain_service.update(db, db_obj, domain_in)

@router.delete("/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill_domain(domain_id: int, db: Session = Depends(get_db)):
    """Delete a skill domain if it has no associated skills."""
    db_obj = skill_domain_service.get_by_id(db, domain_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Skill domain not found")
    
    if skill_domain_service.check_has_skills(db, domain_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete domain because skills reference it."
        )
        
    skill_domain_service.delete(db, db_obj)
