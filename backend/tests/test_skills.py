"""
tests/test_skills.py  (replaces the placeholder)
──────────────────────────────────────────────────
Tests for GET /api/skills — grouped by category, ordering.
"""
import pytest
from httpx import AsyncClient

from app.models.skill import Skill
from app.models.skill_domain import SkillDomain


def _make_domain(db, **kwargs) -> SkillDomain:
    defaults = dict(
        name="Backend",
        sort_order=1
    )
    defaults.update(kwargs)
    d = SkillDomain(**defaults)
    db.add(d)
    db.commit()
    db.refresh(d)
    return d


def _make_skill(db, **kwargs) -> Skill:
    defaults = dict(
        domain_id=1,
        name="Python",
        level="Core",
        sort_order=0,
    )
    defaults.update(kwargs)
    s = Skill(**defaults)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@pytest.mark.asyncio
async def test_skills_empty(client: AsyncClient):
    resp = await client.get("/api/skills")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_skills_grouped(client: AsyncClient, db_session):
    """Skills are grouped by category, items ordered by sort_order."""
    d1 = _make_domain(db_session, name="Backend", sort_order=1)
    d2 = _make_domain(db_session, name="Frontend", sort_order=2)
    _make_skill(db_session, domain_id=d1.id, name="Python", sort_order=1)
    _make_skill(db_session, domain_id=d1.id, name="FastAPI", sort_order=2)
    _make_skill(db_session, domain_id=d2.id, name="JavaScript", sort_order=1)
    db_session.commit()

    resp = await client.get("/api/skills")
    data = resp.json()

    # Two distinct groups
    assert len(data) == 2
    categories = [g["category"] for g in data]
    assert "Backend" in categories
    assert "Frontend" in categories

    backend = next(g for g in data if g["category"] == "Backend")
    assert len(backend["items"]) == 2
    assert backend["items"][0]["name"] == "Python"
    assert backend["items"][1]["name"] == "FastAPI"

    frontend = next(g for g in data if g["category"] == "Frontend")
    assert len(frontend["items"]) == 1
    assert frontend["items"][0]["name"] == "JavaScript"


@pytest.mark.asyncio
async def test_skills_item_shape(client: AsyncClient, db_session):
    """Skill items expose name, icon, and proficiency only (no id/sort_order)."""
    _make_domain(db_session, name="Backend", sort_order=1)
    _make_skill(db_session, domain_id=1, name="SQLAlchemy", level="Hands-on")
    db_session.commit()

    resp = await client.get("/api/skills")
    item = resp.json()[0]["items"][0]
    assert set(item.keys()) == {"name", "level", "icon"}
