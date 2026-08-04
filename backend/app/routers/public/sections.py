"""
routers/public/sections.py  — PUBLIC (unauthenticated)
────────────────────────────────────────────────────────
GET /api/sections           → full nested sidebar tree (visible sections only)
GET /api/sections/{slug}    → single section with content
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.section import SectionDetail, SectionNode
from app.services import section_service

router = APIRouter(prefix="/sections", tags=["public:sections"])


@router.get(
    "",
    response_model=list[SectionNode],
    summary="Get full sidebar tree",
    description=(
        "Returns all visible sections as a nested tree. "
        "Folders carry a `children` list; pages have an empty list. "
        "The `content` field is excluded here — fetch it via `/sections/{slug}`."
    ),
)
def list_sections(db: Session = Depends(get_db)) -> list[SectionNode]:
    return section_service.get_full_tree(db)


@router.get(
    "/{slug}",
    response_model=SectionDetail,
    summary="Get one section by slug",
    description="Returns a single visible section including its full `content` field.",
    responses={404: {"description": "Section not found"}},
)
def get_section(slug: str, db: Session = Depends(get_db)) -> SectionDetail:
    return section_service.get_by_slug(db, slug)
