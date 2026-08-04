"""
routers/public/analytics.py
───────────────────────────
POST /api/analytics/event → Record an analytics event.
"""
from fastapi import APIRouter, Depends, BackgroundTasks, status, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analytics import AnalyticsEvent
from app.schemas.analytics import AnalyticsEventCreate

router = APIRouter(prefix="/analytics", tags=["public:analytics"])


def _record_event(db: Session, payload: AnalyticsEventCreate):
    new_event = AnalyticsEvent(
        event_type=payload.event_type,
        value=payload.value,
        session_id=payload.session_id,
    )
    db.add(new_event)
    db.commit()


@router.post(
    "/event",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Record analytics event",
)
def record_event(
    payload: AnalyticsEventCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Record an analytics event (fire-and-forget)."""
    # Using background task so response is immediate (fire-and-forget)
    background_tasks.add_task(_record_event, db, payload)
    return Response(status_code=status.HTTP_202_ACCEPTED)
