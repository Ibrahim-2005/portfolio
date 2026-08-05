"""
app/schemas/guestbook.py
────────────────────────
Pydantic schemas for GuestbookEntry requests and admin responses.
"""
from datetime import datetime

from pydantic import BaseModel, Field


class GuestbookEntryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    message: str = Field(..., min_length=1, max_length=1000)


class GuestbookEntryOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    name: str
    message: str
    is_approved: bool


# ── Admin response (full entry details) ──────────────────────────────────────
class GuestbookAdminOut(BaseModel):
    """Full guestbook entry returned by admin listing."""
    model_config = {"from_attributes": True}

    id: int
    name: str
    message: str
    created_at: datetime
    is_approved: bool


# ── Admin input: patch ────────────────────────────────────────────────────────
class GuestbookPatch(BaseModel):
    """Body of ``PATCH /api/admin/guestbook/{id}``."""

    is_approved: bool
