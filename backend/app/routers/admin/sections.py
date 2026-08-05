"""
routers/admin/sections.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.section import SectionAdminOut, SectionCreate, SectionUpdate
from app.services import section_service

router = APIRouter(prefix="/sections", tags=["admin:sections"])


@router.post(
    "",
    response_model=SectionAdminOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new section",
)
def create_section(payload: SectionCreate, db: Session = Depends(get_db)) -> SectionAdminOut:
    return section_service.create_section(db, payload)


@router.put(
    "/{section_id}",
    response_model=SectionAdminOut,
    summary="Update a section",
)
def update_section(
    section_id: int, payload: SectionUpdate, db: Session = Depends(get_db)
) -> SectionAdminOut:
    return section_service.update_section(db, section_id, payload)


@router.delete(
    "/{section_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a section",
)
def delete_section(section_id: int, db: Session = Depends(get_db)) -> None:
    section_service.delete_section(db, section_id)
