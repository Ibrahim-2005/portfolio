"""
app/services/skill_domain_service.py
"""
from typing import Sequence
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.skill_domain import SkillDomain
from app.models.skill import Skill
from app.schemas.skill_domain import SkillDomainCreate, SkillDomainUpdate

def get_all(db: Session) -> Sequence[SkillDomain]:
    return db.scalars(
        select(SkillDomain).order_by(SkillDomain.sort_order.asc())
    ).all()

def get_by_id(db: Session, domain_id: int) -> SkillDomain | None:
    return db.get(SkillDomain, domain_id)

def create(db: Session, obj_in: SkillDomainCreate) -> SkillDomain:
    db_obj = SkillDomain(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, db_obj: SkillDomain, obj_in: SkillDomainUpdate) -> SkillDomain:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def check_has_skills(db: Session, domain_id: int) -> bool:
    count = db.scalar(select(Skill.id).where(Skill.domain_id == domain_id).limit(1))
    return count is not None

def delete(db: Session, db_obj: SkillDomain) -> None:
    db.delete(db_obj)
    db.commit()
