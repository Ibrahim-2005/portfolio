"""
routers/public/skills.py  — PUBLIC (unauthenticated)
──────────────────────────────────────────────────────
GET /api/skills   → skills grouped by category
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.skill import SkillGroup
from app.services import skill_service

router = APIRouter(prefix="/skills", tags=["public:skills"])


@router.get(
    "",
    response_model=list[SkillGroup],
    summary="Get skills grouped by category",
    description=(
        "Returns all skills grouped by category in insertion order. "
        "Within each category, skills are ordered by `sort_order`."
    ),
)
def list_skills(db: Session = Depends(get_db)) -> list[SkillGroup]:
    return skill_service.get_grouped(db)
