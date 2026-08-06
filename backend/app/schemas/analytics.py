"""
app/schemas/analytics.py
────────────────────────
Pydantic schemas for AnalyticsEvent requests and admin summary responses.
"""
from typing import Literal

from pydantic import BaseModel, Field


class AnalyticsEventCreate(BaseModel):
    event_type: Literal["page_view", "command"]
    value: str = Field(..., max_length=255)
    session_id: str = Field(..., max_length=100)

class AnalyticsEventOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    event_type: str
    value: str
    session_id: str


# ── Admin summary response ───────────────────────────────────────────────────
class PageViewBucket(BaseModel):
    """Daily page view count."""
    date: str
    count: int


class CommandCount(BaseModel):
    """Terminal command usage count, ordered by count desc."""
    command: str
    count: int


class AnalyticsSummaryOut(BaseModel):
    """Response of ``GET /api/admin/analytics/summary``."""
    page_views: list[PageViewBucket]
    top_commands: list[CommandCount]
