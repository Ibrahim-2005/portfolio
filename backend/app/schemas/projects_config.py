"""
app/schemas/projects_config.py
──────────────────────────────
Pydantic schemas for the Projects page header configuration.
"""
from pydantic import BaseModel, ConfigDict


class ProjectsConfigBase(BaseModel):
    top_text: str | None = None
    heading: str | None = None
    tagline: str | None = None


class ProjectsConfigUpdate(ProjectsConfigBase):
    """Body of ``PUT /api/admin/config/projects``."""
    pass


class ProjectsConfigOut(ProjectsConfigBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
