"""
app/models/message.py
─────────────────────
Contact form submissions. Append-only from the public side;
admin can mark is_read = True via the admin router.
"""
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Message(Base):
    __tablename__ = "messages"

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # ── Explicit indices ──────────────────────────────────────────────────────
    __table_args__ = (Index("ix_messages_is_read", "is_read"),)

    def __repr__(self) -> str:
        return f"<Message id={self.id} email={self.email!r} is_read={self.is_read}>"
