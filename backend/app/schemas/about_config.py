"""
app/schemas/about_config.py
───────────────────────────
Pydantic schemas for the About page configuration.
"""
from pydantic import BaseModel, ConfigDict, Field


class AboutFocusItem(BaseModel):
    emoji: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)


class AboutLearningItem(BaseModel):
    emoji: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)


class AboutConfigBase(BaseModel):
    top_text: str | None = None
    big_text: str | None = None
    tagline: str | None = None
    about_me: str | None = None
    current_focus: list[AboutFocusItem] = Field(default_factory=list)
    currently_learning: list[AboutLearningItem] = Field(default_factory=list)


class AboutConfigUpdate(AboutConfigBase):
    """Body of ``PUT /api/admin/config/about``."""


class AboutConfigOut(AboutConfigBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
