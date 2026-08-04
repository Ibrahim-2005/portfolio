"""
app/schemas/skill.py
────────────────────
Pydantic schemas for Skill requests and responses.
(Stub — full schemas implemented in Phase 2 alongside routers.)
"""
from pydantic import BaseModel


class SkillBase(BaseModel):
    pass


class SkillCreate(SkillBase):
    pass


class SkillUpdate(SkillBase):
    pass


class SkillOut(SkillBase):
    model_config = {"from_attributes": True}
