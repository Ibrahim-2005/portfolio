"""
app/schemas/skill.py
────────────────────
Pydantic schemas for Skill API responses.

GET /skills returns skills grouped by category:
  [{"category": "Backend", "items": [{"name": "Python", "proficiency": "Advanced"}]}]

This grouping is done in the service layer and represented here with
SkillItem + SkillGroup.
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class SkillItem(BaseModel):
    """A single skill row, flattened for the public API (id/sort_order omitted)."""
    model_config = ConfigDict(from_attributes=True)

    name: str
    proficiency: str


class SkillGroup(BaseModel):
    """One category bucket containing its ordered skill items."""
    category: str
    items: list[SkillItem]
