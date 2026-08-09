"""
app/schemas/contact_link.py
───────────────────────────
Pydantic schemas for Contact Link entities.
"""
from pydantic import BaseModel, ConfigDict, Field


class ContactLinkBase(BaseModel):
    platform: str = Field(..., min_length=1)
    url: str = Field(..., min_length=1)
    icon: str | None = None
    enabled: bool = True
    sort_order: int = 0


class ContactLinkCreate(ContactLinkBase):
    """Body of ``POST /api/admin/contact-links``."""
    pass


class ContactLinkUpdate(BaseModel):
    """Body of ``PUT /api/admin/contact-links/{id}``. All fields optional."""
    platform: str | None = Field(default=None, min_length=1)
    url: str | None = Field(default=None, min_length=1)
    icon: str | None = None
    enabled: bool | None = None
    sort_order: int | None = None


class ContactLinkOut(ContactLinkBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
