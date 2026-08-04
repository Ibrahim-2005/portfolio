"""
app/schemas/section.py
──────────────────────
Pydantic schemas for Section requests and responses.
(Stub — full schemas implemented in Phase 2 alongside routers.)
"""
from pydantic import BaseModel


class SectionBase(BaseModel):
    pass


class SectionCreate(SectionBase):
    pass


class SectionUpdate(SectionBase):
    pass


class SectionOut(SectionBase):
    model_config = {"from_attributes": True}
