from unittest.mock import patch

import pytest
from fastapi import HTTPException

from app.services.cloudinary_service import cloudinary_service


@patch("app.services.cloudinary_service.settings")
def test_upload_image_missing_credentials(mock_settings):
    """Test that CloudinaryService fails safely when credentials are missing."""
    # Simulate missing credentials
    mock_settings.CLOUDINARY_CLOUD_NAME = None
    mock_settings.CLOUDINARY_API_KEY = None
    mock_settings.CLOUDINARY_API_SECRET = None

    with pytest.raises(HTTPException) as exc:
        cloudinary_service.upload_image(b"fakebytes", "some/folder")

    assert exc.value.status_code == 502
    assert "Cloudinary credentials are not fully configured" in str(exc.value.detail)

@patch("app.services.cloudinary_service.settings")
def test_delete_image_missing_credentials(mock_settings):
    """Test that CloudinaryService fails safely when credentials are missing."""
    mock_settings.CLOUDINARY_CLOUD_NAME = None
    mock_settings.CLOUDINARY_API_KEY = None
    mock_settings.CLOUDINARY_API_SECRET = None

    with pytest.raises(HTTPException) as exc:
        cloudinary_service.delete_image("some_public_id")

    assert exc.value.status_code == 502
    assert "Cloudinary credentials are not fully configured" in str(exc.value.detail)
