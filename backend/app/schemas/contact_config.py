"""
app/schemas/contact_config.py
─────────────────────────────
Pydantic schemas for the Contact page header configuration.
"""
from pydantic import BaseModel, ConfigDict


class ContactConfigBase(BaseModel):
    top_text: str | None = None
    heading: str | None = None
    tagline: str | None = None
    form_footer_text: str | None = None


class ContactConfigUpdate(ContactConfigBase):
    """Body of ``PUT /api/admin/config/contact``."""


class ContactConfigOut(ContactConfigBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
