"""
routers/public/guestbook.py
───────────────────────────
POST /api/guestbook → Submit a new guestbook entry.
"""
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.limiter import limiter
from app.models.guestbook import GuestbookEntry
from app.schemas.guestbook import GuestbookEntryCreate, GuestbookEntryOut

router = APIRouter(prefix="/guestbook", tags=["public:guestbook"])


@router.post(
    "",
    response_model=GuestbookEntryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a guestbook entry",
)
@limiter.limit("5/minute")
def submit_guestbook_entry(
    request: Request,
    payload: GuestbookEntryCreate,
    db: Session = Depends(get_db),
) -> GuestbookEntryOut:
    """Submit a guestbook entry. Defaults to is_approved=False."""
    new_entry = GuestbookEntry(
        name=payload.name,
        message=payload.message,
        is_approved=False,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry
