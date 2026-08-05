"""
app/schemas/section.py
──────────────────────
Pydantic schemas for Section API responses.

Two response shapes are used:
  - SectionNode   : item in the full tree (nested children, no content)
  - SectionDetail : single-section response that includes content

Admin input schemas:
  - SectionCreate : body of POST /api/admin/sections
  - SectionUpdate : body of PUT /api/admin/sections/{id} (partial update)
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


# ── Shared leaf fields exposed in every section response ──────────────────────
class _SectionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    icon: str | None = None
    type: str
    parent_id: int | None = None
    sort_order: int


# ── Tree node (used in GET /sections) ─────────────────────────────────────────
class SectionNode(_SectionBase):
    """
    Represents one node in the sidebar tree.
    Folders carry a ``children`` list; pages have an empty list.
    ``content`` is intentionally excluded — callers fetch it via /sections/{slug}.
    """
    children: list[SectionNode] = []

# Pydantic v2 requires explicit model_rebuild() for self-referencing models.
SectionNode.model_rebuild()


# ── Detail view (used in GET /sections/{slug}) ────────────────────────────────
class SectionDetail(_SectionBase):
    """Single section with its full content field."""
    content: str | None = None
    is_visible: bool


# ── Admin response ────────────────────────────────────────────────────────────
class SectionAdminOut(SectionDetail):
    """Admin response for a section (same as detail, always includes is_visible)."""
    pass


# ── Admin input: create ───────────────────────────────────────────────────────
class SectionCreate(BaseModel):
    """Body of ``POST /api/admin/sections``."""

    slug: str = Field(..., min_length=1, max_length=255)
    title: str = Field(..., min_length=1, max_length=255)
    icon: str | None = None
    type: str = "page"
    parent_id: int | None = None
    sort_order: int = 0
    content: str | None = None
    is_visible: bool = True


# ── Admin input: update (partial) ─────────────────────────────────────────────
class SectionUpdate(BaseModel):
    """Body of ``PUT /api/admin/sections/{id}``. All fields optional."""

    slug: str | None = Field(default=None, min_length=1, max_length=255)
    title: str | None = Field(default=None, min_length=1, max_length=255)
    icon: str | None = None
    type: str | None = None
    parent_id: int | None = None
    sort_order: int | None = None
    content: str | None = None
    is_visible: bool | None = None
