"""
tests/test_guestbook.py
───────────────────────
Tests for POST /api/guestbook
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models.guestbook import GuestbookEntry


@pytest.mark.asyncio
async def test_submit_guestbook_entry(client: AsyncClient, db_session: Session):
    payload = {
        "name": "Test Guest",
        "message": "Hello from guestbook!",
    }
    resp = await client.post("/api/guestbook", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] is not None
    assert data["name"] == "Test Guest"
    assert data["message"] == "Hello from guestbook!"
    assert data["is_approved"] is False

    # Verify DB
    entry = db_session.query(GuestbookEntry).first()
    assert entry.name == "Test Guest"
    assert entry.message == "Hello from guestbook!"
    assert entry.is_approved is False


@pytest.mark.asyncio
async def test_submit_guestbook_validation(client: AsyncClient):
    payload = {
        "name": "",  # invalid
        "message": "",  # invalid
    }
    resp = await client.post("/api/guestbook", json=payload)
    assert resp.status_code == 422
