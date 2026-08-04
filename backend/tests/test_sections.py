"""
tests/test_sections.py
──────────────────────
Tests for:
  GET /api/sections          → full tree, nested children, visible-only filter
  GET /api/sections/{slug}   → single section detail, 404 on miss
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient

from app.models.section import Section


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_section(db, **kwargs) -> Section:
    defaults = dict(
        slug="test-slug",
        title="Test",
        type="page",
        sort_order=0,
        is_visible=True,
        content=None,
        parent_id=None,
        icon=None,
    )
    defaults.update(kwargs)
    section = Section(**defaults)
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


# ── GET /api/sections ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_sections_empty(client: AsyncClient):
    """Empty DB → empty list."""
    resp = await client.get("/api/sections")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_sections_flat_pages(client: AsyncClient, db_session):
    """Two visible pages with no parent → two root nodes, no children."""
    _make_section(db_session, slug="about", title="About", sort_order=1)
    _make_section(db_session, slug="projects", title="Projects", sort_order=2)
    db_session.commit()

    resp = await client.get("/api/sections")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["slug"] == "about"
    assert data[1]["slug"] == "projects"
    assert data[0]["children"] == []


@pytest.mark.asyncio
async def test_sections_nested_tree(client: AsyncClient, db_session):
    """Folder with two children → root has children list with 2 nodes."""
    folder = _make_section(
        db_session, slug="about-me", title="About Me",
        type="folder", sort_order=1,
    )
    _make_section(
        db_session, slug="bio", title="Bio",
        parent_id=folder.id, sort_order=1,
    )
    _make_section(
        db_session, slug="education", title="Education",
        parent_id=folder.id, sort_order=2,
    )
    db_session.commit()

    resp = await client.get("/api/sections")
    assert resp.status_code == 200
    data = resp.json()

    # Only one root (the folder)
    assert len(data) == 1
    assert data[0]["slug"] == "about-me"
    children = data[0]["children"]
    assert len(children) == 2
    assert children[0]["slug"] == "bio"
    assert children[1]["slug"] == "education"


@pytest.mark.asyncio
async def test_sections_hidden_excluded(client: AsyncClient, db_session):
    """Sections with is_visible=False must not appear in the tree."""
    _make_section(db_session, slug="visible", title="Visible", sort_order=1)
    _make_section(
        db_session, slug="hidden", title="Hidden",
        sort_order=2, is_visible=False,
    )
    db_session.commit()

    resp = await client.get("/api/sections")
    data = resp.json()
    slugs = [n["slug"] for n in data]
    assert "visible" in slugs
    assert "hidden" not in slugs


@pytest.mark.asyncio
async def test_sections_content_not_exposed(client: AsyncClient, db_session):
    """Tree nodes must NOT include the content field."""
    _make_section(db_session, slug="bio", title="Bio", content="# Hello")
    db_session.commit()

    resp = await client.get("/api/sections")
    node = resp.json()[0]
    assert "content" not in node


# ── GET /api/sections/{slug} ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_section_detail_found(client: AsyncClient, db_session):
    """Detail endpoint returns section with content."""
    _make_section(db_session, slug="bio", title="Bio", content="# My Bio")
    db_session.commit()

    resp = await client.get("/api/sections/bio")
    assert resp.status_code == 200
    data = resp.json()
    assert data["slug"] == "bio"
    assert data["content"] == "# My Bio"


@pytest.mark.asyncio
async def test_section_detail_404(client: AsyncClient):
    """Unknown slug → 404 with detail message."""
    resp = await client.get("/api/sections/does-not-exist")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_section_detail_hidden_is_404(client: AsyncClient, db_session):
    """Hidden sections must not be findable via the public detail endpoint."""
    _make_section(db_session, slug="secret", title="Secret", is_visible=False)
    db_session.commit()

    resp = await client.get("/api/sections/secret")
    assert resp.status_code == 404
