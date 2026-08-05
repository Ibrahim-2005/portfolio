"""
routers/admin/projects.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["admin:projects"])


@router.post(
    "",
    response_model=ProjectOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)) -> ProjectOut:
    dump = payload.model_dump()
    # Serialize highlights list to string before inserting to DB
    if "highlights" in dump and dump["highlights"] is not None:
        dump["highlights"] = "\n".join(dump["highlights"])
        
    row = Project(**dump)
    db.add(row)
    db.commit()
    db.refresh(row)
    return ProjectOut.model_validate(row)


@router.put(
    "/{project_id}",
    response_model=ProjectOut,
    summary="Update a project",
)
def update_project(
    project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)
) -> ProjectOut:
    row = db.execute(select(Project).where(Project.id == project_id)).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "highlights" in update_data and update_data["highlights"] is not None:
        update_data["highlights"] = "\n".join(update_data["highlights"])

    for key, value in update_data.items():
        setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return ProjectOut.model_validate(row)


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a project",
)
def delete_project(project_id: int, db: Session = Depends(get_db)) -> None:
    row = db.execute(select(Project).where(Project.id == project_id)).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(row)
    db.commit()
