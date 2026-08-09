import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.education import Education
from app.models.section import Section
from app.models.project import Project
from app.models.skill import Skill
from app.models.home_config import HomeConfig


@pytest.mark.asyncio
async def test_get_education_public(client: AsyncClient, db_session: Session):
    # Seed data
    db_session.add(Education(id=1, qualification="Q2", institution="I2", start_year=2021, sort_order=2))
    db_session.add(Education(id=2, qualification="Q1", institution="I1", start_year=2020, sort_order=1))
    db_session.commit()

    resp = await client.get("/api/education")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["qualification"] == "Q1"
    assert data[1]["qualification"] == "Q2"

@pytest.mark.asyncio
async def test_get_education_public_empty(client: AsyncClient):
    resp = await client.get("/api/education")
    assert resp.status_code == 200
    assert resp.json() == []

@pytest.mark.asyncio
async def test_get_education_admin_unauthorized(client: AsyncClient):
    resp = await client.get("/api/admin/education")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_post_education_admin(client: AsyncClient, auth_headers: dict):
    payload = {
        "qualification": "BSc",
        "institution": "University",
        "start_year": 2015,
        "end_year": 2019,
        "grade": "First Class",
        "sort_order": 1
    }
    resp = await client.post("/api/admin/education", headers=auth_headers, json=payload)
    assert resp.status_code == 201
    assert resp.json()["qualification"] == "BSc"
    assert resp.json()["id"] is not None

@pytest.mark.asyncio
async def test_put_education_admin(client: AsyncClient, auth_headers: dict, db_session: Session):
    db_session.add(Education(id=1, qualification="Old", institution="Inst", start_year=2020))
    db_session.commit()

    resp = await client.put("/api/admin/education/1", headers=auth_headers, json={"qualification": "New"})
    assert resp.status_code == 200
    assert resp.json()["qualification"] == "New"
    
    db_session.refresh(db_session.get(Education, 1))
    assert db_session.get(Education, 1).qualification == "New"

@pytest.mark.asyncio
async def test_delete_education_admin(client: AsyncClient, auth_headers: dict, db_session: Session):
    db_session.add(Education(id=1, qualification="Old", institution="Inst", start_year=2020))
    db_session.commit()

    resp = await client.delete("/api/admin/education/1", headers=auth_headers)
    assert resp.status_code == 204
    assert db_session.get(Education, 1) is None

@pytest.mark.asyncio
async def test_education_not_found(client: AsyncClient, auth_headers: dict):
    resp = await client.put("/api/admin/education/999", headers=auth_headers, json={"qualification": "New"})
    assert resp.status_code == 404
    
    resp = await client.delete("/api/admin/education/999", headers=auth_headers)
    assert resp.status_code == 404

@pytest.mark.asyncio
async def test_education_invalid_payload(client: AsyncClient, auth_headers: dict):
    resp = await client.post("/api/admin/education", headers=auth_headers, json={"qualification": ""}) # Missing institution/start_year
    assert resp.status_code == 422

@pytest.mark.asyncio
async def test_education_untouched_entities(client: AsyncClient, auth_headers: dict, db_session: Session):
    db_session.add(Section(id=1, slug="s1", title="T", content="C"))
    db_session.add(Project(id=1, title="P1", description="D", tech_stack=[]))
    db_session.add(Skill(id=1, name="S1", proficiency=10))
    db_session.add(HomeConfig(id=1, top_text="Top"))
    db_session.commit()
    
    await client.post("/api/admin/education", headers=auth_headers, json={
        "qualification": "BSc", "institution": "Univ", "start_year": 2020
    })
    
    assert db_session.get(Section, 1) is not None
    assert db_session.get(Project, 1) is not None
    assert db_session.get(Skill, 1) is not None
    assert db_session.get(HomeConfig, 1) is not None
