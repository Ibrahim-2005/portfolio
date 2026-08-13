from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models.sidebar_item import SidebarItem


def _seed_sidebar(db: Session):
    items = [
        {"slug": "home", "label": "Home", "sort_order": 1, "is_visible": True, "extension": None},
        {"slug": "about", "label": "About Me", "sort_order": 2, "is_visible": True, "extension": ".md"},
        {"slug": "projects", "label": "Projects", "sort_order": 3, "is_visible": True, "extension": None},
        {"slug": "skills", "label": "Skills", "sort_order": 4, "is_visible": True, "extension": ".md"},
        {"slug": "contact", "label": "Contact", "sort_order": 5, "is_visible": True, "extension": ".md"},
        {"slug": "readme", "label": "README", "sort_order": 6, "is_visible": True, "extension": ".md"},
        {"slug": "resume", "label": "Resume", "sort_order": 7, "is_visible": True, "extension": ".pdf"}
    ]
    for d in items:
        db.add(SidebarItem(**d))
    db.commit()

@pytest.mark.asyncio
async def test_get_sidebar_items_public(client: AsyncClient, db_session: Session):
    _seed_sidebar(db_session)
    
    item = db_session.query(SidebarItem).filter(SidebarItem.slug == "home").first()
    item.is_visible = False
    db_session.commit()

    response = await client.get("/api/sidebar")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    slugs = [i["slug"] for i in data]
    assert "home" not in slugs
    assert "about" in slugs

@pytest.mark.asyncio
async def test_admin_get_sidebar_items(client: AsyncClient, auth_headers: dict, db_session: Session):
    _seed_sidebar(db_session)
    
    response = await client.get("/api/admin/sidebar", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 7
    slugs = [i["slug"] for i in data]
    assert "home" in slugs

@pytest.mark.asyncio
async def test_admin_update_sidebar_item(client: AsyncClient, auth_headers: dict, db_session: Session):
    _seed_sidebar(db_session)
    item = db_session.query(SidebarItem).filter(SidebarItem.slug == "about").first()
    
    payload = {
        "label": "About Me Changed",
        "is_visible": False,
        "sort_order": 99,
        "extension": ".txt"
    }
    response = await client.patch(f"/api/admin/sidebar/{item.id}", headers=auth_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["label"] == "About Me Changed"
    assert data["is_visible"] is False
    assert data["sort_order"] == 99
    assert data["extension"] == ".txt"

    pub_res = await client.get("/api/sidebar")
    pub_data = pub_res.json()
    slugs = [i["slug"] for i in pub_data]
    assert "about" not in slugs

@pytest.mark.asyncio
@patch("app.routers.admin.sidebar.cloudinary_service.upload_image", return_value=("http://res.cloudinary.com/fake/image.png", "fake_public_id"))
@patch("app.routers.admin.sidebar.cloudinary_service.delete_image", return_value=None)
async def test_admin_upload_and_remove_icon(mock_delete, mock_upload, client: AsyncClient, auth_headers: dict, db_session: Session):
    _seed_sidebar(db_session)
    item = db_session.query(SidebarItem).filter(SidebarItem.slug == "contact").first()
    
    file_data = b"fake_png_data_123"
    files = {"file": ("icon.png", file_data, "image/png")}
    response = await client.post(f"/api/admin/sidebar/{item.id}/icon", headers=auth_headers, files=files)
    assert response.status_code == 200
    assert response.json()["has_icon"] is True
    assert response.json()["icon_url"] == "http://res.cloudinary.com/fake/image.png"

    # Testing binary endpoint should return 404 for new uploads since we use Cloudinary
    icon_res = await client.get(f"/api/sidebar/{item.id}/icon")
    assert icon_res.status_code == 404

    del_res = await client.delete(f"/api/admin/sidebar/{item.id}/icon", headers=auth_headers)
    assert del_res.status_code == 200
    assert del_res.json()["has_icon"] is False

    icon_res_after = await client.get(f"/api/sidebar/{item.id}/icon")
    assert icon_res_after.status_code == 404
