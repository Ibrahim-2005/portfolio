"""
app/schemas/project.py
──────────────────────
Pydantic schemas for Project API responses and admin input.

``highlights`` is stored as a plain newline-delimited text blob in Postgres
but is exposed as ``list[str]`` in the API to match the shape in api-reference.md.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProjectTechStackItem(BaseModel):
    name: str = Field(..., min_length=1)
    icon: str | None = Field(default=None, min_length=1)


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    subtitle: str | None = None
    description: str
    tech_stack: list[ProjectTechStackItem] = Field(default_factory=list)
    repo_url: str | None = None
    live_url: str | None = None
    highlights: list[str] = []
    sort_order: int
    featured: bool

    @field_validator("tech_stack", mode="before")
    @classmethod
    def _coerce_tech_stack(cls, v: object) -> list[dict[str, str | None]]:
        """
        Accept strings (e.g. ["Flask"]), dicts ({"name": "Flask", "icon": ...}),
        or objects with .name attributes, coercing them cleanly.
        """
        if v is None:
            return []
        if isinstance(v, list):
            result = []
            for item in v:
                if isinstance(item, str):
                    if item.strip():
                        result.append({"name": item.strip(), "icon": None})
                elif isinstance(item, dict):
                    result.append(item)
                elif hasattr(item, "name"):
                    result.append({"name": item.name, "icon": getattr(item, "icon", None)})
            return result
        return []

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


# ── Admin input: create ───────────────────────────────────────────────────────
class ProjectCreate(BaseModel):
    """Body of ``POST /api/admin/projects``."""

    title: str = Field(..., min_length=1, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    description: str = Field(..., min_length=1)
    tech_stack: list[ProjectTechStackItem] = Field(default_factory=list)
    repo_url: str | None = None
    live_url: str | None = None
    highlights: list[str] = []
    sort_order: int = 0
    featured: bool = False

    @field_validator("tech_stack", mode="before")
    @classmethod
    def _coerce_tech_stack(cls, v: object) -> list[dict[str, str | None]]:
        if v is None:
            return []
        if isinstance(v, list):
            result = []
            for item in v:
                if isinstance(item, str):
                    if item.strip():
                        result.append({"name": item.strip(), "icon": None})
                elif isinstance(item, dict):
                    result.append(item)
                elif hasattr(item, "name"):
                    result.append({"name": item.name, "icon": getattr(item, "icon", None)})
            return result
        return []


# ── Admin input: update (partial) ─────────────────────────────────────────────
class ProjectUpdate(BaseModel):
    """Body of ``PUT /api/admin/projects/{id}``. All fields optional."""

    title: str | None = Field(default=None, min_length=1, max_length=255)
    subtitle: str | None = Field(default=None, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    tech_stack: list[ProjectTechStackItem] | None = None
    repo_url: str | None = None
    live_url: str | None = None
    highlights: list[str] | None = None
    sort_order: int | None = None
    featured: bool | None = None

    @field_validator("tech_stack", mode="before")
    @classmethod
    def _coerce_tech_stack(cls, v: object) -> list[dict[str, str | None]] | None:
        if v is None:
            return None
        if isinstance(v, list):
            result = []
            for item in v:
                if isinstance(item, str):
                    if item.strip():
                        result.append({"name": item.strip(), "icon": None})
                elif isinstance(item, dict):
                    result.append(item)
                elif hasattr(item, "name"):
                    result.append({"name": item.name, "icon": getattr(item, "icon", None)})
            return result
        return None
