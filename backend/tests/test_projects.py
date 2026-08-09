"""
tests/test_projects.py
──────────────────────
Tests for GET /api/projects — ordering and response shape.
"""
import pytest
from httpx import AsyncClient

from app.models.project import Project


def _make_project(db, **kwargs) -> Project:
    defaults = dict(
        title="Project",
        description="A project",
        tech_stack=[{"name": "Python", "icon": "python-icon"}],
        repo_url=None,
        live_url=None,
        highlights=None,
        sort_order=0,
    )
    defaults.update(kwargs)
    p = Project(**defaults)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@pytest.mark.asyncio
async def test_projects_empty(client: AsyncClient):
    resp = await client.get("/api/projects")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_projects_ordering(client: AsyncClient, db_session):
    """Projects are returned in ascending sort_order."""
    _make_project(db_session, title="Second", sort_order=2)
    _make_project(db_session, title="First", sort_order=1)
    db_session.commit()

    resp = await client.get("/api/projects")
    data = resp.json()
    assert len(data) == 2
    assert data[0]["title"] == "First"
    assert data[1]["title"] == "Second"


@pytest.mark.asyncio
async def test_projects_shape(client: AsyncClient, db_session):
    """Response includes all expected keys."""
    _make_project(
        db_session,
        title="Job Tracker",
        description="A job tracker",
        tech_stack=[{"name": "Flask", "icon": "flask-icon"}, {"name": "PostgreSQL", "icon": "pg-icon"}],
        repo_url="https://github.com/example/job-tracker",
        live_url="https://example.com",
        highlights="Built with Flask\nPostgres backend",
        sort_order=1,
    )
    db_session.commit()

    resp = await client.get("/api/projects")
    p = resp.json()[0]
    assert p["title"] == "Job Tracker"
    assert p["tech_stack"] == [{"name": "Flask", "icon": "flask-icon"}, {"name": "PostgreSQL", "icon": "pg-icon"}]
    assert p["repo_url"] == "https://github.com/example/job-tracker"
    assert p["live_url"] == "https://example.com"
    # highlights text is split into a list
    assert isinstance(p["highlights"], list)
    assert len(p["highlights"]) == 2
    assert "Flask" in p["highlights"][0]


@pytest.mark.asyncio
async def test_projects_highlights_none(client: AsyncClient, db_session):
    """highlights=None → empty list in response."""
    _make_project(db_session, highlights=None)
    db_session.commit()

    resp = await client.get("/api/projects")
    assert resp.json()[0]["highlights"] == []
