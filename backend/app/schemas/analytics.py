"""
app/schemas/analytics.py
────────────────────────
Pydantic schemas for AnalyticsEvent requests.
"""
from pydantic import BaseModel, Field
from typing import Literal, Optional


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
