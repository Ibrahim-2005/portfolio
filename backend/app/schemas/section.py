"""
app/schemas/section.py
──────────────────────
Pydantic schemas for Section API responses.

Two response shapes are used:
  - SectionNode   : item in the full tree (nested children, no content)
  - SectionDetail : single-section response that includes content
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict


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
