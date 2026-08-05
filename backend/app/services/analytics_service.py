"""
services/analytics_service.py
──────────────────────────────
Business logic for aggregating analytics_events for the admin dashboard.
Implemented in Phase 2.
"""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.analytics import AnalyticsEvent
from app.schemas.analytics import CommandCount, PageViewBucket


def aggregate_page_views(db: Session) -> list[PageViewBucket]:
    """Return page view counts grouped by date."""
    # Portable date cast using func.date()
    rows = db.execute(
        select(
            func.date(AnalyticsEvent.created_at).label("date"),
            func.count().label("count"),
        )
        .where(AnalyticsEvent.event_type == "page_view")
        .group_by(func.date(AnalyticsEvent.created_at))
        .order_by("date")
    ).all()
    
    return [PageViewBucket(date=str(row.date), count=row.count) for row in rows]


def aggregate_commands(db: Session) -> list[CommandCount]:
    """Return terminal command counts grouped by value."""
    rows = db.execute(
        select(
            AnalyticsEvent.value.label("command"),
            func.count().label("count"),
        )
        .where(AnalyticsEvent.event_type == "command")
        .group_by(AnalyticsEvent.value)
        .order_by(func.count().desc())
        .limit(20)
    ).all()
    
    return [CommandCount(command=str(row.command), count=row.count) for row in rows]
