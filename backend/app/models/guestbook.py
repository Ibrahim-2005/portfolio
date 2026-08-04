"""
app/models/guestbook.py
───────────────────────
Public guestbook submissions. Hidden until is_approved = True by admin,
preventing spam from going live automatically.
"""
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class GuestbookEntry(Base):
    __tablename__ = "guestbook_entries"

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # ── Explicit indices ──────────────────────────────────────────────────────
    __table_args__ = (Index("ix_guestbook_entries_is_approved", "is_approved"),)

    def __repr__(self) -> str:
        return (
            f"<GuestbookEntry id={self.id} name={self.name!r} "
            f"is_approved={self.is_approved}>"
        )
