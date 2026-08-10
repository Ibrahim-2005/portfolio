"""
app/schemas/resume_config.py
────────────────────────────
Pydantic schemas for the Resume page configuration.
"""
from pydantic import BaseModel, ConfigDict


class ResumeConfigBase(BaseModel):
    top_text: str | None = None
    heading: str | None = None
    tagline: str | None = None


class ResumeConfigUpdate(ResumeConfigBase):
    """Body of ``PUT /api/admin/config/resume``. File path is not updated here."""


class ResumeConfigOut(ResumeConfigBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    file_path: str | None = None
