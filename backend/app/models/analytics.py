"""
app/models/analytics.py
────────────────────────
Append-only analytics event log. session_id is a random client-generated UUID
stored in localStorage — no PII, no auth required to log an event.
"""
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────────────────
    # "page_view" | "command"
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # The slug/path for page_view, or the command string for command events
    value: Mapped[str | None] = mapped_column(String(512), nullable=True)
    # Random UUID generated on the client and persisted in localStorage
    session_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    # ── Explicit indices ──────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_analytics_events_event_type", "event_type"),
        Index("ix_analytics_events_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<AnalyticsEvent id={self.id} event_type={self.event_type!r} "
            f"value={self.value!r}>"
        )
