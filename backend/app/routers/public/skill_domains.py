"""
app/routers/public/skill_domains.py
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.skill_domain import SkillDomainOut
from app.services import skill_domain_service

router = APIRouter(prefix="/skill-domains", tags=["Skill Domains"])

@router.get("", response_model=list[SkillDomainOut])
def get_skill_domains(db: Session = Depends(get_db)):
    """Retrieve all skill domains ordered by sort_order ascending."""
    return skill_domain_service.get_all(db)
