"""
app/schemas/project.py
──────────────────────
Pydantic schemas for Project requests and responses.
(Stub — full schemas implemented in Phase 2 alongside routers.)
"""
from pydantic import BaseModel


class ProjectBase(BaseModel):
    pass


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    model_config = {"from_attributes": True}
