"""
app/schemas/home_config.py
──────────────────────────
Pydantic schemas for the Home page configuration.
"""
from pydantic import BaseModel, ConfigDict, Field


class HomeRole(BaseModel):
    label: str = Field(..., min_length=1)
    icon: str = Field(..., min_length=1)


class HomeSocialLink(BaseModel):
    platform: str = Field(..., min_length=1)
    url: str = Field(..., min_length=1)
    icon: str = Field(..., min_length=1)
    enabled: bool = True
    sort_order: int = 0


class HomeConfigBase(BaseModel):
    top_text: str | None = None
    name: str | None = None
    tagline: str | None = None
    intro: str | None = None
    roles: list[HomeRole] = Field(default_factory=list)
    social_links: list[HomeSocialLink] = Field(default_factory=list)
    action_projects_label: str | None = None
    action_about_label: str | None = None
    action_contact_label: str | None = None


class HomeConfigUpdate(HomeConfigBase):
    """Body of ``PUT /api/admin/config/home``."""


class HomeConfigOut(HomeConfigBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
