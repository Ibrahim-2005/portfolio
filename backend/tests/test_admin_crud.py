"""
tests/test_admin_crud.py
────────────────────────
Comprehensive tests for all protected admin CRUD endpoints.
"""
import pytest
from httpx import AsyncClient

from app.models.analytics import AnalyticsEvent
from app.models.guestbook import GuestbookEntry
from app.models.message import Message


# ── SECTIONS ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_section_crud(client: AsyncClient, auth_headers: dict):
    # 1. Create a root folder
    resp = await client.post(
        "/api/admin/sections",
        json={"slug": "about", "title": "About", "type": "folder", "sort_order": 1},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    folder = resp.json()
    assert folder["slug"] == "about"
    assert folder["parent_id"] is None

    # 2. Create a child page
    resp = await client.post(
        "/api/admin/sections",
        json={
            "slug": "bio",
            "title": "Bio",
            "type": "page",
            "parent_id": folder["id"],
            "content": "My biography",
            "sort_order": 1,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    page = resp.json()
    assert page["parent_id"] == folder["id"]

    # 3. Create failure: Duplicate slug
    resp = await client.post(
        "/api/admin/sections",
        json={"slug": "bio", "title": "Duplicate", "sort_order": 2},
        headers=auth_headers,
    )
    assert resp.status_code == 400

    # 4. Create failure: Invalid parent_id
    resp = await client.post(
        "/api/admin/sections",
        json={"slug": "invalid", "title": "Invalid", "parent_id": 999, "sort_order": 2},
        headers=auth_headers,
    )
    assert resp.status_code == 404

    # 5. Update failure: Duplicate slug (change bio to about)
    resp = await client.put(
        f"/api/admin/sections/{page['id']}",
        json={"slug": "about"},
        headers=auth_headers,
    )
    assert resp.status_code == 400

    # 6. Update success
    resp = await client.put(
        f"/api/admin/sections/{page['id']}",
        json={"title": "My Bio"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["title"] == "My Bio"
    assert resp.json()["slug"] == "bio" # unchanged

    # 7. Delete failure: Folder has children
    resp = await client.delete(f"/api/admin/sections/{folder['id']}", headers=auth_headers)
    assert resp.status_code == 409

    # 8. Delete success: Child first, then folder
    resp = await client.delete(f"/api/admin/sections/{page['id']}", headers=auth_headers)
    assert resp.status_code == 204

    resp = await client.delete(f"/api/admin/sections/{folder['id']}", headers=auth_headers)
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_section_public_visibility(client: AsyncClient, auth_headers: dict):
    # 1. Create a root folder via admin API
    resp = await client.post(
        "/api/admin/sections",
        json={"slug": "public-test", "title": "Public Test", "type": "folder", "sort_order": 99},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    folder = resp.json()

    # 2. Verify it appears in the public GET /api/sections response
    public_resp = await client.get("/api/sections")
    assert public_resp.status_code == 200
    sections = public_resp.json()
    
    # Check if a section with the slug "public-test" exists
    found = next((s for s in sections if s["slug"] == "public-test"), None)
    assert found is not None
    assert found["title"] == "Public Test"

    # 3. Clean up
    await client.delete(f"/api/admin/sections/{folder['id']}", headers=auth_headers)


# ── PROJECTS ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_project_crud(client: AsyncClient, auth_headers: dict):
    # 1. Create
    resp = await client.post(
        "/api/admin/projects",
        json={
            "title": "Portfolio",
            "description": "My OS portfolio",
            "tech_stack": ["React", "FastAPI"],
            "highlights": ["Cool feature 1", "Cool feature 2"],
            "sort_order": 1,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    proj = resp.json()
    assert proj["title"] == "Portfolio"
    assert proj["tech_stack"] == ["React", "FastAPI"]
    assert proj["highlights"] == ["Cool feature 1", "Cool feature 2"]

    # 2. Update
    resp = await client.put(
        f"/api/admin/projects/{proj['id']}",
        json={"title": "Portfolio OS", "highlights": ["Only one highlight"]},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["title"] == "Portfolio OS"
    assert updated["tech_stack"] == ["React", "FastAPI"] # unchanged
    assert updated["highlights"] == ["Only one highlight"]

    # 3. Delete
    resp = await client.delete(f"/api/admin/projects/{proj['id']}", headers=auth_headers)
    assert resp.status_code == 204

    # 4. Delete failure: not found
    resp = await client.delete(f"/api/admin/projects/{proj['id']}", headers=auth_headers)
    assert resp.status_code == 404


# ── SKILLS ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_skill_crud(client: AsyncClient, auth_headers: dict):
    # 1. Create
    resp = await client.post(
        "/api/admin/skills",
        json={"category": "Backend", "name": "Python", "proficiency": "Expert", "sort_order": 1},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    skill = resp.json()
    assert skill["name"] == "Python"

    # 2. Update
    resp = await client.put(
        f"/api/admin/skills/{skill['id']}",
        json={"proficiency": "Advanced"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["proficiency"] == "Advanced"

    # 3. Delete
    resp = await client.delete(f"/api/admin/skills/{skill['id']}", headers=auth_headers)
    assert resp.status_code == 204


# ── MESSAGES ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_message_endpoints(client: AsyncClient, auth_headers: dict, db_session):
    # Seed messages
    m1 = Message(name="A", email="a@a.com", message="hello", is_read=False)
    m2 = Message(name="B", email="b@b.com", message="world", is_read=True)
    db_session.add_all([m1, m2])
    db_session.commit()
    db_session.refresh(m1)

    # 1. List all
    resp = await client.get("/api/admin/messages", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    # 2. Filter unread
    resp = await client.get("/api/admin/messages?is_read=false", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["id"] == m1.id

    # 3. Patch to read
    resp = await client.patch(
        f"/api/admin/messages/{m1.id}",
        json={"is_read": True},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["is_read"] is True


# ── GUESTBOOK ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_guestbook_endpoints(client: AsyncClient, auth_headers: dict, db_session):
    # Seed entries
    e1 = GuestbookEntry(name="A", message="hello", is_approved=False)
    e2 = GuestbookEntry(name="B", message="world", is_approved=True)
    db_session.add_all([e1, e2])
    db_session.commit()
    db_session.refresh(e1)

    # 1. List all
    resp = await client.get("/api/admin/guestbook", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    # 2. Filter approved
    resp = await client.get("/api/admin/guestbook?is_approved=true", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["id"] == e2.id

    # 3. Patch to approve
    resp = await client.patch(
        f"/api/admin/guestbook/{e1.id}",
        json={"is_approved": True},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["is_approved"] is True


# ── ANALYTICS ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_analytics_summary(client: AsyncClient, auth_headers: dict, db_session):
    # Seed events
    ev1 = AnalyticsEvent(event_type="page_view", value="/about", session_id="1")
    ev2 = AnalyticsEvent(event_type="page_view", value="/about", session_id="2")
    ev3 = AnalyticsEvent(event_type="command", value="ls", session_id="1")
    db_session.add_all([ev1, ev2, ev3])
    db_session.commit()

    resp = await client.get("/api/admin/analytics/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    
    assert len(data["page_views"]) == 1
    assert data["page_views"][0]["count"] == 2 # 2 views for /about today
    
    assert len(data["top_commands"]) == 1
    assert data["top_commands"][0]["command"] == "ls"
    assert data["top_commands"][0]["count"] == 1


# ── UNAUTHORIZED ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    endpoints = [
        ("POST", "/api/admin/sections", {}),
        ("POST", "/api/admin/projects", {}),
        ("POST", "/api/admin/skills", {}),
        ("GET", "/api/admin/messages", None),
        ("GET", "/api/admin/guestbook", None),
        ("GET", "/api/admin/analytics/summary", None),
    ]

    for method, url, json_body in endpoints:
        resp = await client.request(method, url, json=json_body)
        assert resp.status_code == 401
