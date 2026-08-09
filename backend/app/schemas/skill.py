"""
app/schemas/skill.py
────────────────────
Pydantic schemas for Skill API responses and admin input.

GET /skills returns skills grouped by category:
  [{"category": "Backend", "items": [{"name": "Python", "proficiency": "Advanced"}]}]

This grouping is done in the service layer and represented here with
SkillItem + SkillGroup.
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class SkillItem(BaseModel):
    """A single skill row, flattened for the public API (id/sort_order omitted)."""
    model_config = ConfigDict(from_attributes=True)

    name: str
    proficiency: int = Field(..., ge=0, le=100)
    icon: str | None = None


class SkillGroup(BaseModel):
    """One category bucket containing its ordered skill items."""
    category: str
    items: list[SkillItem]


# ── Admin response (flat row with id) ─────────────────────────────────────────
class SkillOut(BaseModel):
    """Full skill row for admin endpoints."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str | None = None
    domain_id: int | None = None
    name: str
    icon: str | None = None
    proficiency: int = Field(..., ge=0, le=100)
    sort_order: int


# ── Admin input: create ───────────────────────────────────────────────────────
class SkillCreate(BaseModel):
    """Body of ``POST /api/admin/skills``."""

    category: str | None = Field(default=None, min_length=1, max_length=100)
    domain_id: int | None = None
    name: str = Field(..., min_length=1, max_length=100)
    icon: str | None = Field(default=None, max_length=255)
    proficiency: int = Field(..., ge=0, le=100)
    sort_order: int = 0


# ── Admin input: update (partial) ─────────────────────────────────────────────
class SkillUpdate(BaseModel):
    """Body of ``PUT /api/admin/skills/{id}``. All fields optional."""

    category: str | None = Field(default=None, min_length=1, max_length=100)
    domain_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=100)
    icon: str | None = Field(default=None, max_length=255)
    proficiency: int | None = Field(default=None, ge=0, le=100)
    sort_order: int | None = None
