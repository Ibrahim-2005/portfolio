"""
app/schemas/public_settings.py
──────────────────────────────
Pydantic schemas for the Public Settings configuration.
"""
from pydantic import BaseModel, ConfigDict


class PublicSettingsBase(BaseModel):
    tech_stack_text: str | None = None
    author_text: str | None = None


class PublicSettingsUpdate(PublicSettingsBase):
    """Body of ``PUT /api/admin/config/settings``."""


class PublicSettingsOut(PublicSettingsBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
