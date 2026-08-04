"""
routers/public/projects.py  — PUBLIC (unauthenticated)
────────────────────────────────────────────────────────
GET /api/projects   → all projects ordered by sort_order
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectOut

router = APIRouter(prefix="/projects", tags=["public:projects"])


@router.get(
    "",
    response_model=list[ProjectOut],
    summary="Get all featured projects",
    description="Returns all projects ordered by `sort_order`.",
)
def list_projects(db: Session = Depends(get_db)) -> list[ProjectOut]:
    rows = db.execute(
        select(Project).order_by(Project.sort_order)
    ).scalars().all()
    return [ProjectOut.model_validate(row) for row in rows]
