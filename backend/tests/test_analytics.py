"""
tests/test_analytics.py
───────────────────────
Tests for POST /api/analytics/event
"""
import asyncio
import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models.analytics import AnalyticsEvent


@pytest.mark.asyncio
async def test_record_analytics_event(client: AsyncClient, db_session: Session):
    payload = {
        "event_type": "page_view",
        "value": "/about",
        "session_id": "session_123",
    }
    resp = await client.post("/api/analytics/event", json=payload)
    assert resp.status_code == 202

    # Since it's a background task, wait briefly to allow it to complete
    await asyncio.sleep(0.1)

    # Verify DB
    event = db_session.query(AnalyticsEvent).first()
    assert event.event_type == "page_view"
    assert event.value == "/about"
    assert event.session_id == "session_123"


@pytest.mark.asyncio
async def test_record_analytics_validation(client: AsyncClient):
    payload = {
        "event_type": "invalid_type",  # invalid
        "value": "/about",
        "session_id": "session_123",
    }
    resp = await client.post("/api/analytics/event", json=payload)
    assert resp.status_code == 422
