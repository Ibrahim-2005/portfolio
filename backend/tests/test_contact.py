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
        "phone": "123-456-7890",
        "subject": "Test Subject",
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
    assert msg.phone == "123-456-7890"
    assert msg.subject == "Test Subject"
    assert msg.message == "This is a test message."


@pytest.mark.asyncio
async def test_submit_contact_without_optional(client: AsyncClient, db_session: Session):
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "message": "This is a test message.",
    }
    resp = await client.post("/api/contact", json=payload)
    assert resp.status_code == 201

    msg = db_session.query(Message).filter_by(email="test@example.com").order_by(Message.id.desc()).first()
    assert msg.phone is None
    assert msg.subject is None


@pytest.mark.asyncio
async def test_submit_contact_validation(client: AsyncClient):
    payload = {
        "name": "",  # invalid
        "email": "not-an-email",  # invalid
        "message": "short",  # invalid (<10 chars)
    }
    resp = await client.post("/api/contact", json=payload)
    assert resp.status_code == 422

@pytest.mark.asyncio
async def test_submit_contact_rate_limit(client: AsyncClient):
    payload = {
        "name": "Spammer",
        "email": "spam@example.com",
        "message": "This is a spam message.",
    }

    statuses = []
    for _ in range(8):
        resp = await client.post("/api/contact", json=payload)
        statuses.append(resp.status_code)

    assert 201 in statuses
    assert 429 in statuses
    first_429 = statuses.index(429)
    assert all(s == 429 for s in statuses[first_429:])
