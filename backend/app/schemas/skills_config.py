"""
app/schemas/skills_config.py
────────────────────────────
Pydantic schemas for the Skills page header configuration.
"""
from pydantic import BaseModel, ConfigDict


class SkillsConfigBase(BaseModel):
    top_text: str | None = None
    heading: str | None = None
    tagline: str | None = None


class SkillsConfigUpdate(SkillsConfigBase):
    """Body of ``PUT /api/admin/config/skills``."""


class SkillsConfigOut(SkillsConfigBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
