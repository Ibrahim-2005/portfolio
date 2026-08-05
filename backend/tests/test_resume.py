"""
tests/test_resume.py
────────────────────────
Tests for the public resume endpoint.
"""
import pytest
from unittest.mock import patch
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_resume_success(client: AsyncClient):
    """
    Test that the resume endpoint returns HTTP 200 and the correct content type.
    """
    resp = await client.get("/api/resume")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"

@pytest.mark.asyncio
async def test_get_resume_missing(client: AsyncClient):
    """
    Test that the resume endpoint returns HTTP 404 when the file is missing.
    """
    with patch("os.path.exists", return_value=False):
        resp = await client.get("/api/resume")
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Resume PDF not found"
