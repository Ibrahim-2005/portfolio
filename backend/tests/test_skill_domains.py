import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.models.skill_domain import SkillDomain


@pytest.mark.asyncio
async def test_get_skill_domains_public(client: AsyncClient, db_session: Session):
    db_session.add(SkillDomain(id=1, name="D2", sort_order=2))
    db_session.add(SkillDomain(id=2, name="D1", sort_order=1))
    db_session.commit()

    resp = await client.get("/api/skill-domains")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["name"] == "D1"
    assert data[1]["name"] == "D2"

@pytest.mark.asyncio
async def test_skill_domains_admin_unauthorized(client: AsyncClient):
    resp = await client.get("/api/admin/skill-domains")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_post_skill_domain_admin(client: AsyncClient, auth_headers: dict):
    resp = await client.post("/api/admin/skill-domains", headers=auth_headers, json={"name": "Frontend"})
    assert resp.status_code == 201
    assert resp.json()["name"] == "Frontend"

@pytest.mark.asyncio
async def test_put_skill_domain_admin(client: AsyncClient, auth_headers: dict, db_session: Session):
    db_session.add(SkillDomain(id=1, name="Old"))
    db_session.commit()

    resp = await client.put("/api/admin/skill-domains/1", headers=auth_headers, json={"name": "New"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New"
    
@pytest.mark.asyncio
async def test_delete_skill_domain_unused(client: AsyncClient, auth_headers: dict, db_session: Session):
    db_session.add(SkillDomain(id=1, name="Old"))
    db_session.commit()

    resp = await client.delete("/api/admin/skill-domains/1", headers=auth_headers)
    assert resp.status_code == 204
    assert db_session.get(SkillDomain, 1) is None

@pytest.mark.asyncio
async def test_skill_domain_not_found(client: AsyncClient, auth_headers: dict):
    resp = await client.put("/api/admin/skill-domains/999", headers=auth_headers, json={"name": "New"})
    assert resp.status_code == 404
    
    resp = await client.delete("/api/admin/skill-domains/999", headers=auth_headers)
    assert resp.status_code == 404

@pytest.mark.asyncio
async def test_skill_domain_invalid_payload(client: AsyncClient, auth_headers: dict):
    resp = await client.post("/api/admin/skill-domains", headers=auth_headers, json={"name": ""})
    assert resp.status_code == 422

@pytest.mark.asyncio
async def test_delete_skill_domain_in_use(client: AsyncClient, auth_headers: dict, db_session: Session):
    db_session.add(SkillDomain(id=1, name="Used"))
    db_session.add(Skill(id=1, name="React", level="Core", domain_id=1))
    db_session.commit()

    resp = await client.delete("/api/admin/skill-domains/1", headers=auth_headers)
    assert resp.status_code == 409
    
    assert db_session.get(SkillDomain, 1) is not None
    assert db_session.get(Skill, 1) is not None
