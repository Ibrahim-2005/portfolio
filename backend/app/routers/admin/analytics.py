"""
routers/admin/analytics.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.analytics import AnalyticsSummaryOut
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["admin:analytics"])


@router.get(
    "/summary",
    response_model=AnalyticsSummaryOut,
    summary="Get analytics summary",
)
def get_summary(db: Session = Depends(get_db)) -> AnalyticsSummaryOut:
    page_views = analytics_service.aggregate_page_views(db)
    commands = analytics_service.aggregate_commands(db)
    
    return AnalyticsSummaryOut(
        page_views=page_views,
        top_commands=commands,
    )
