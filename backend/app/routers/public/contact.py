"""
routers/public/contact.py
─────────────────────────
POST /api/contact → Submit a new message.
"""
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.limiter import limiter
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageOut

router = APIRouter(prefix="/contact", tags=["public:contact"])


@router.post(
    "",
    response_model=MessageOut,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a contact message",
)
@limiter.limit("5/minute")
def submit_contact(
    request: Request,
    payload: MessageCreate,
    db: Session = Depends(get_db),
) -> MessageOut:
    """Submit a message via the contact form."""
    new_message = Message(
        name=payload.name,
        email=payload.email,
        message=payload.message,
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message
