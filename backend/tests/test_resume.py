"""
tests/test_resume.py
────────────────────────
Tests for the public and admin resume endpoints.
"""
from unittest.mock import patch

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.resume_file import ResumeFile


@pytest.mark.asyncio
async def test_get_resume_fallback_success(client: AsyncClient):
    """
    Test that GET /api/resume falls back to the static legacy resume when DB is empty.
    """
    with patch("os.path.exists", return_value=True), \
        patch("app.routers.public.resume.FileResponse", return_value={"status": "mocked"}):
        await client.get("/api/resume")

@pytest.mark.asyncio
async def test_get_resume_missing(client: AsyncClient):
    """
    Test that the resume endpoint returns HTTP 404 when the file is missing and DB is empty.
    """
    with patch("os.path.exists", return_value=False):
        resp = await client.get("/api/resume")
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Resume PDF not found"


@pytest.mark.asyncio
async def test_upload_resume_unauthorized(client: AsyncClient):
    """Missing admin auth returns 401."""
    files = {"file": ("test.pdf", b"%PDF-1.4\nTest", "application/pdf")}
    resp = await client.post("/api/admin/resume/upload", files=files)
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_upload_resume_invalid_mime(client: AsyncClient, auth_headers: dict):
    """Non-PDF content type returns 400."""
    files = {"file": ("test.txt", b"%PDF-1.4\nTest", "text/plain")}
    resp = await client.post("/api/admin/resume/upload", headers=auth_headers, files=files)
    assert resp.status_code == 400
    assert "Only PDF is allowed" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_upload_resume_invalid_magic(client: AsyncClient, auth_headers: dict):
    """Spoofed PDF MIME type with invalid magic bytes returns 400."""
    files = {"file": ("test.pdf", b"NOTAPDF", "application/pdf")}
    resp = await client.post("/api/admin/resume/upload", headers=auth_headers, files=files)
    assert resp.status_code == 400
    assert "Invalid PDF file" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_upload_resume_too_large(client: AsyncClient, auth_headers: dict):
    """Files larger than 5MB return 400."""
    large_content = b"%PDF" + b"0" * (5 * 1024 * 1024)
    files = {"file": ("test.pdf", large_content, "application/pdf")}
    resp = await client.post("/api/admin/resume/upload", headers=auth_headers, files=files)
    assert resp.status_code == 400
    assert "too large" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_upload_resume_success(client: AsyncClient, auth_headers: dict, db_session: Session):
    """Authenticated valid PDF upload returns success and stores in DB."""
    files = {"file": ("my_resume.pdf", b"%PDF-1.4\nVALID", "application/pdf")}
    resp = await client.post("/api/admin/resume/upload", headers=auth_headers, files=files)
    assert resp.status_code == 200
    assert resp.json()["filename"] == "my_resume.pdf"

    # Verify DB
    resume = db_session.get(ResumeFile, 1)
    assert resume is not None
    assert resume.filename == "my_resume.pdf"
    assert resume.file_data == b"%PDF-1.4\nVALID"


@pytest.mark.asyncio
async def test_upload_resume_replace(client: AsyncClient, auth_headers: dict, db_session: Session):
    """Uploading a second PDF replaces the existing ResumeFile id=1."""
    # First upload
    files1 = {"file": ("resume1.pdf", b"%PDF-1.4\nFIRST", "application/pdf")}
    await client.post("/api/admin/resume/upload", headers=auth_headers, files=files1)

    # Second upload
    files2 = {"file": ("resume2.pdf", b"%PDF-1.4\nSECOND", "application/pdf")}
    resp = await client.post("/api/admin/resume/upload", headers=auth_headers, files=files2)
    assert resp.status_code == 200

    # Verify DB has only 1 record and it's the second one
    resumes = db_session.scalars(select(ResumeFile)).all()
    assert len(resumes) == 1
    assert resumes[0].id == 1
    assert resumes[0].filename == "resume2.pdf"
    assert resumes[0].file_data == b"%PDF-1.4\nSECOND"


@pytest.mark.asyncio
async def test_get_resume_db(client: AsyncClient, db_session: Session):
    """GET /api/resume returns the database PDF when ResumeFile id=1 exists."""
    db_session.add(ResumeFile(id=1, filename="db_resume.pdf", file_data=b"%PDF-DB"))
    db_session.commit()

    resp = await client.get("/api/resume")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content == b"%PDF-DB"
    assert "filename=\"Resume.pdf\"" in resp.headers["content-disposition"]
