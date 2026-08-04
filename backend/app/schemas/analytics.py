"""
app/schemas/analytics.py
────────────────────────
Pydantic schemas for AnalyticsEvent requests and responses.
(Stub — full schemas implemented in Phase 2 alongside routers.)
"""
from pydantic import BaseModel


class AnalyticsEventBase(BaseModel):
    pass


class AnalyticsEventCreate(AnalyticsEventBase):
    pass


class AnalyticsEventOut(AnalyticsEventBase):
    model_config = {"from_attributes": True}
