"""
app/services/cloudinary_service.py
──────────────────────────────────
Service for handling Cloudinary image uploads and deletions.
"""


import io
import logging

import cloudinary
import cloudinary.api
import cloudinary.uploader
from fastapi import HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary globally using settings if available
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )


class CloudinaryService:
    def __init__(self):
        pass

    def _validate_credentials(self):
        if not (settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET):
            raise ValueError("Cloudinary credentials are not fully configured.")

    def upload_image(self, file_bytes: bytes, folder: str) -> tuple[str, str]:
        """
        Uploads an image to Cloudinary.
        Returns a tuple: (secure_url, public_id)
        """
        try:
            self._validate_credentials()

            file_obj = io.BytesIO(file_bytes)

            result = cloudinary.uploader.upload(
                file_obj,
                folder=folder,
                resource_type="image",
            )

            secure_url = result.get("secure_url")
            public_id = result.get("public_id")

            if not secure_url or not public_id:
                raise ValueError("Cloudinary response missing URL or public_id")

            return secure_url, public_id
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e!s}")

            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Cloudinary upload failed: {e!s}"
            )

    def delete_image(self, public_id: str):
        """
        Deletes an image from Cloudinary by its public_id.
        """
        if not public_id:
            return

        try:
            self._validate_credentials()

            result = cloudinary.uploader.destroy(public_id, invalidate=True)
            if result.get("result") not in ["ok", "not found"]:
                raise ValueError(f"Unexpected deletion result: {result.get('result')}")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Cloudinary deletion failed: {e!s}"
            )

cloudinary_service = CloudinaryService()
