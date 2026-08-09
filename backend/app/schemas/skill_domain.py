"""
app/schemas/skill_domain.py
───────────────────────────
Pydantic schemas for Skill Domain entities.
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class SkillDomainBase(BaseModel):
    name: str = Field(..., min_length=1)
    sort_order: int = 0


class SkillDomainCreate(SkillDomainBase):
    """Body of ``POST /api/admin/skill-domains``."""
    pass


class SkillDomainUpdate(BaseModel):
    """Body of ``PUT /api/admin/skill-domains/{id}``. All fields optional."""
    name: str | None = Field(default=None, min_length=1)
    sort_order: int | None = None


class SkillDomainOut(SkillDomainBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
