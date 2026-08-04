"""
tests/test_contact.py
─────────────────────
Tests for POST /api/contact
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models.message import Message


@pytest.mark.asyncio
async def test_submit_contact(client: AsyncClient, db_session: Session):
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "message": "This is a test message.",
    }
    resp = await client.post("/api/contact", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["id"] is not None
    assert data["is_read"] is False

    # Verify DB
    msg = db_session.query(Message).first()
    assert msg.name == "Test User"
    assert msg.email == "test@example.com"
    assert msg.message == "This is a test message."


@pytest.mark.asyncio
async def test_submit_contact_validation(client: AsyncClient):
    payload = {
        "name": "",  # invalid
        "email": "not-an-email",  # invalid
        "message": "short",  # invalid (<10 chars)
    }
    resp = await client.post("/api/contact", json=payload)
    assert resp.status_code == 422
