"""
routers/admin/guestbook.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.guestbook import GuestbookEntry
from app.schemas.guestbook import GuestbookAdminOut, GuestbookPatch

router = APIRouter(prefix="/guestbook", tags=["admin:guestbook"])


@router.get(
    "",
    response_model=list[GuestbookAdminOut],
    summary="List all guestbook entries",
)
def list_guestbook(
    is_approved: bool | None = None, db: Session = Depends(get_db)
) -> list[GuestbookAdminOut]:
    query = select(GuestbookEntry).order_by(GuestbookEntry.created_at.desc())
    if is_approved is not None:
        query = query.where(GuestbookEntry.is_approved == is_approved)
        
    rows = db.execute(query).scalars().all()
    return [GuestbookAdminOut.model_validate(row) for row in rows]


@router.patch(
    "/{entry_id}",
    response_model=GuestbookAdminOut,
    summary="Approve or reject a guestbook entry",
)
def update_guestbook(
    entry_id: int, payload: GuestbookPatch, db: Session = Depends(get_db)
) -> GuestbookAdminOut:
    row = db.execute(select(GuestbookEntry).where(GuestbookEntry.id == entry_id)).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Guestbook entry not found")

    row.is_approved = payload.is_approved
    db.commit()
    db.refresh(row)
    return GuestbookAdminOut.model_validate(row)
