"""
routers/admin/skills.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillOut, SkillUpdate

router = APIRouter(prefix="/skills", tags=["admin:skills"])


@router.post(
    "",
    response_model=SkillOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new skill",
)
def create_skill(payload: SkillCreate, db: Session = Depends(get_db)) -> SkillOut:
    row = Skill(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return SkillOut.model_validate(row)


@router.put(
    "/{skill_id}",
    response_model=SkillOut,
    summary="Update a skill",
)
def update_skill(
    skill_id: int, payload: SkillUpdate, db: Session = Depends(get_db)
) -> SkillOut:
    row = db.execute(select(Skill).where(Skill.id == skill_id)).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Skill not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return SkillOut.model_validate(row)


@router.delete(
    "/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a skill",
)
def delete_skill(skill_id: int, db: Session = Depends(get_db)) -> None:
    row = db.execute(select(Skill).where(Skill.id == skill_id)).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(row)
    db.commit()
