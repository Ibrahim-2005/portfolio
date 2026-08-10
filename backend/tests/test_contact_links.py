import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models.contact_link import ContactLink


@pytest.mark.asyncio
async def test_get_contact_links_public(client: AsyncClient, db_session: Session):
    db_session.add(ContactLink(id=1, platform="GH", url="http://gh", enabled=True, sort_order=2))
    db_session.add(ContactLink(id=2, platform="LI", url="http://li", enabled=False, sort_order=1))
    db_session.add(ContactLink(id=3, platform="TW", url="http://tw", enabled=True, sort_order=1))
    db_session.commit()

    resp = await client.get("/api/contact-links")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["platform"] == "TW"  # sort_order 1
    assert data[1]["platform"] == "GH"  # sort_order 2

@pytest.mark.asyncio
async def test_get_contact_links_admin(client: AsyncClient, auth_headers: dict, db_session: Session):
    db_session.add(ContactLink(id=1, platform="GH", url="http://gh", enabled=True, sort_order=2))
    db_session.add(ContactLink(id=2, platform="LI", url="http://li", enabled=False, sort_order=1))
    db_session.commit()

    resp = await client.get("/api/admin/contact-links", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert data[0]["platform"] == "LI"
    assert data[1]["platform"] == "GH"

@pytest.mark.asyncio
async def test_contact_links_admin_unauthorized(client: AsyncClient):
    resp = await client.get("/api/admin/contact-links")
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_post_contact_link_admin(client: AsyncClient, auth_headers: dict):
    resp = await client.post("/api/admin/contact-links", headers=auth_headers, json={"platform": "Email", "url": "mailto:test@test.com"})
    assert resp.status_code == 201
    assert resp.json()["platform"] == "Email"

@pytest.mark.asyncio
async def test_put_contact_link_admin(client: AsyncClient, auth_headers: dict, db_session: Session):
    db_session.add(ContactLink(id=1, platform="Old", url="http://old"))
    db_session.commit()

    resp = await client.put("/api/admin/contact-links/1", headers=auth_headers, json={"platform": "New"})
    assert resp.status_code == 200
    assert resp.json()["platform"] == "New"
    
@pytest.mark.asyncio
async def test_delete_contact_link(client: AsyncClient, auth_headers: dict, db_session: Session):
    db_session.add(ContactLink(id=1, platform="Old", url="http://old"))
    db_session.commit()

    resp = await client.delete("/api/admin/contact-links/1", headers=auth_headers)
    assert resp.status_code == 204
    assert db_session.get(ContactLink, 1) is None

@pytest.mark.asyncio
async def test_contact_link_not_found(client: AsyncClient, auth_headers: dict):
    resp = await client.put("/api/admin/contact-links/999", headers=auth_headers, json={"platform": "New"})
    assert resp.status_code == 404
    
    resp = await client.delete("/api/admin/contact-links/999", headers=auth_headers)
    assert resp.status_code == 404

@pytest.mark.asyncio
async def test_contact_link_invalid_payload(client: AsyncClient, auth_headers: dict):
    resp = await client.post("/api/admin/contact-links", headers=auth_headers, json={"platform": ""}) # missing url
    assert resp.status_code == 422
