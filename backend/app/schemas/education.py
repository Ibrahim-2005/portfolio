"""
app/schemas/education.py
────────────────────────
Pydantic schemas for Education entities.
"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class EducationBase(BaseModel):
    qualification: str = Field(..., min_length=1)
    institution: str = Field(..., min_length=1)
    start_year: int
    end_year: int | None = None
    grade: str | None = None
    description: str | None = None
    sort_order: int = 0


class EducationCreate(EducationBase):
    """Body of ``POST /api/admin/education``."""
    pass


class EducationUpdate(BaseModel):
    """Body of ``PUT /api/admin/education/{id}``. All fields optional."""
    qualification: str | None = Field(default=None, min_length=1)
    institution: str | None = Field(default=None, min_length=1)
    start_year: int | None = None
    end_year: int | None = None
    grade: str | None = None
    description: str | None = None
    sort_order: int | None = None


class EducationOut(EducationBase):
    """Response schema."""
    model_config = ConfigDict(from_attributes=True)
    id: int
