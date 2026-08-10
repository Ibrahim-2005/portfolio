import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.home_config import HomeConfig
from app.models.project import Project
from app.models.projects_config import ProjectsConfig
from app.models.public_settings import PublicSettings
from app.models.skill import Skill


@pytest.mark.asyncio
async def test_get_pages(client: AsyncClient, db_session: Session):
    """Test GET /api/pages/{slug} for all supported singletons."""
    # Seed the DB first
    for model_class in [HomeConfig, ProjectsConfig, PublicSettings]:
        if model_class == HomeConfig:
            instance = model_class(id=1, top_text="Test")
        elif model_class == PublicSettings:
            instance = PublicSettings(id=1, tech_stack_text="Tech", author_text="Author")
        else:
            instance = model_class(id=1, top_text="Test", heading="Heading")
        db_session.add(instance)
    db_session.commit()

    # GET home
    resp = await client.get("/api/pages/home")
    assert resp.status_code == 200
    assert resp.json()["top_text"] == "Test"

    # GET projects
    resp = await client.get("/api/pages/projects")
    assert resp.status_code == 200
    assert resp.json()["top_text"] == "Test"

    # GET settings
    resp = await client.get("/api/pages/settings")
    assert resp.status_code == 200
    assert resp.json()["tech_stack_text"] == "Tech"

@pytest.mark.asyncio
async def test_get_pages_explicit_endpoints(client: AsyncClient, db_session: Session):
    from app.models.certificates_config import CertificatesConfig
    from app.models.readme_config import ReadmeConfig
    db_session.add(ReadmeConfig(id=1, content="Readme Content"))
    db_session.add(CertificatesConfig(id=1, content="Certificates Content"))
    db_session.commit()

    resp = await client.get("/api/pages/readme")
    assert resp.status_code == 200
    assert resp.json()["content"] == "Readme Content"

    resp = await client.get("/api/pages/certificates")
    assert resp.status_code == 200
    assert resp.json()["content"] == "Certificates Content"

@pytest.mark.asyncio
async def test_get_unsupported_slug(client: AsyncClient):
    """Unsupported slug returns 404."""
    resp = await client.get("/api/pages/unknown")
    assert resp.status_code == 404

@pytest.mark.asyncio
async def test_get_missing_singleton(client: AsyncClient, db_session: Session):
    """Missing singleton returns the expected 404 behavior."""
    # Ensure about is missing
    resp = await client.get("/api/pages/about")
    assert resp.status_code == 404

@pytest.mark.asyncio
async def test_put_pages_auth(client: AsyncClient, auth_headers: dict):
    """PUT /api/admin/pages/home requires authentication."""
    resp = await client.put("/api/admin/pages/home", json={"top_text": "New"})
    assert resp.status_code == 401

    resp = await client.put("/api/admin/pages/home", headers=auth_headers, json={"top_text": "New"})
    assert resp.status_code == 200
    assert resp.json()["top_text"] == "New"

@pytest.mark.asyncio
async def test_put_creates_missing_singleton(client: AsyncClient, auth_headers: dict, db_session: Session):
    """PUT creates missing singleton and updates id=1."""
    resp = await client.put("/api/admin/pages/resume", headers=auth_headers, json={"top_text": "Resume New"})
    assert resp.status_code == 200
    assert resp.json()["top_text"] == "Resume New"

@pytest.mark.asyncio
async def test_put_invalid_nested_json(client: AsyncClient, auth_headers: dict):
    """Invalid nested JSON is rejected by Pydantic."""
    resp = await client.put("/api/admin/pages/home", headers=auth_headers, json={
        "social_links": [{"platform": "OnlyPlatform"}] # Missing url
    })
    assert resp.status_code == 422

@pytest.mark.asyncio
async def test_put_updates_only_id_1(client: AsyncClient, auth_headers: dict, db_session: Session):
    """Verify the API updates only id=1 and does not create duplicate singleton rows."""
    
    # Run PUT twice
    await client.put("/api/admin/pages/contact", headers=auth_headers, json={"top_text": "C1"})
    await client.put("/api/admin/pages/contact", headers=auth_headers, json={"top_text": "C2"})
    
    # Check rows in DB
    from app.models.contact_config import ContactConfig
    rows = db_session.scalars(select(ContactConfig)).all()
    assert len(rows) == 1
    assert rows[0].id == 1
    assert rows[0].top_text == "C2"

@pytest.mark.asyncio
async def test_existing_data_untouched(client: AsyncClient, auth_headers: dict, db_session: Session):
    """Verify existing sections/project/skill data is untouched."""
    # Seed projects, skills
    db_session.add(Project(id=1, title="TestProj", description="Desc", tech_stack=[], sort_order=1))
    db_session.add(Skill(id=1, name="TestSkill", proficiency=50, sort_order=1))
    db_session.commit()
    
    # Hit singleton API
    await client.put("/api/admin/pages/home", headers=auth_headers, json={"top_text": "Home"})
    
    assert db_session.get(Project, 1).title == "TestProj"
    assert db_session.get(Skill, 1).name == "TestSkill"
