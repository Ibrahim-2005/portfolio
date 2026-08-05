"""
routers/admin/messages.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.message import Message
from app.schemas.message import MessageAdminOut, MessagePatch

router = APIRouter(prefix="/messages", tags=["admin:messages"])


@router.get(
    "",
    response_model=list[MessageAdminOut],
    summary="List all messages",
)
def list_messages(
    is_read: Optional[bool] = None, db: Session = Depends(get_db)
) -> list[MessageAdminOut]:
    query = select(Message).order_by(Message.created_at.desc())
    if is_read is not None:
        query = query.where(Message.is_read == is_read)
        
    rows = db.execute(query).scalars().all()
    return [MessageAdminOut.model_validate(row) for row in rows]


@router.patch(
    "/{message_id}",
    response_model=MessageAdminOut,
    summary="Mark a message as read/unread",
)
def update_message(
    message_id: int, payload: MessagePatch, db: Session = Depends(get_db)
) -> MessageAdminOut:
    row = db.execute(select(Message).where(Message.id == message_id)).scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Message not found")

    row.is_read = payload.is_read
    db.commit()
    db.refresh(row)
    return MessageAdminOut.model_validate(row)
