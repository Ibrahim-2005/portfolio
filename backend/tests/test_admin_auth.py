"""
tests/test_admin_auth.py
────────────────────────
Pytest tests for admin login, token issuance, and protected route access.

Route-protection tests target ``GET /api/admin/me`` — a real, implemented
endpoint — rather than stub routes that don't have handlers yet.
"""
import pytest

from app.core.security import create_access_token, hash_password
from app.models.admin_user import AdminUser

# ── Helpers ───────────────────────────────────────────────────────────────────

_ADMIN_ME = "/api/admin/me"


def _seed_admin(db, email="admin@test.com", password="correct-horse-battery"):
    """Insert an admin user with a bcrypt-hashed password and return the row."""
    admin = AdminUser(email=email, hashed_password=hash_password(password))
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


# ── Login endpoint ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_success(client, db_session):
    """Valid credentials → 200 with an access_token."""
    _seed_admin(db_session)

    resp = await client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "correct-horse-battery"},
    )

    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    # Token should be a non-empty string
    assert isinstance(body["access_token"], str) and len(body["access_token"]) > 0


@pytest.mark.asyncio
async def test_login_wrong_password(client, db_session):
    """Wrong password → 401."""
    _seed_admin(db_session)

    resp = await client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "wrong-password"},
    )

    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_login_nonexistent_email(client, db_session):
    """Email not in the database → 401 (same message — no user enumeration)."""
    resp = await client.post(
        "/api/auth/login",
        json={"email": "nobody@test.com", "password": "anything"},
    )

    assert resp.status_code == 401
    assert resp.json()["detail"] == "Invalid email or password"


@pytest.mark.asyncio
async def test_login_missing_fields(client):
    """Missing required fields → 422 validation error."""
    resp = await client.post("/api/auth/login", json={})
    assert resp.status_code == 422


# ── Protected admin routes ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_admin_route_no_token(client):
    """Hitting an admin route without Authorization header → 401."""
    resp = await client.get(_ADMIN_ME)
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_admin_route_invalid_token(client):
    """Hitting an admin route with a garbage token → 401."""
    resp = await client.get(
        _ADMIN_ME,
        headers={"Authorization": "Bearer this-is-not-a-real-jwt"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_admin_route_expired_token(client, db_session):
    """An expired JWT should be rejected with 401."""
    from datetime import timedelta

    admin = _seed_admin(db_session)
    # Create a token that expired 1 minute ago
    token = create_access_token(
        data={"sub": str(admin.id)},
        expires_delta=timedelta(minutes=-1),
    )

    resp = await client.get(
        _ADMIN_ME,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_admin_route_valid_token(client, db_session):
    """Full round-trip: login → use token → access admin route."""
    _seed_admin(db_session)

    # Step 1: Login
    login_resp = await client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "correct-horse-battery"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Step 2: Use token on a protected route
    resp = await client.get(
        _ADMIN_ME,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["email"] == "admin@test.com"


@pytest.mark.asyncio
async def test_admin_route_token_for_deleted_user(client, db_session):
    """A valid JWT whose user was deleted after issuance → 401."""
    admin = _seed_admin(db_session)
    token = create_access_token(data={"sub": str(admin.id)})

    # Delete the admin
    db_session.delete(admin)
    db_session.commit()

    resp = await client.get(
        _ADMIN_ME,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_rate_limit(client, db_session):
    """Exceeding rate limit on login (5/min) -> 429 Too Many Requests."""
    _seed_admin(db_session)

    statuses = []
    for _ in range(8):
        resp = await client.post(
            "/api/auth/login",
            json={"email": "admin@test.com", "password": "wrong-password"},
        )
        statuses.append(resp.status_code)

    assert 429 in statuses
    first_429 = statuses.index(429)
    assert all(s == 429 for s in statuses[first_429:])
