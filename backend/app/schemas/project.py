"""
app/schemas/project.py
──────────────────────
Pydantic schemas for Project API responses.

``highlights`` is stored as a plain newline-delimited text blob in Postgres
but is exposed as ``list[str]`` in the API to match the shape in api-reference.md.
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, field_validator


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    tech_stack: list[str]
    repo_url: str | None = None
    live_url: str | None = None
    highlights: list[str] = []
    sort_order: int

    @field_validator("highlights", mode="before")
    @classmethod
    def _split_highlights(cls, v: object) -> list[str]:
        """
        Accept both a plain string (DB storage) and an already-split list.
        Splits on newlines and strips blank lines.
        """
        if v is None:
            return []
        if isinstance(v, list):
            return [item for item in v if item]
        # Plain text from the DB — split on newlines
        return [line.strip() for line in str(v).splitlines() if line.strip()]
