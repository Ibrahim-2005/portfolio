"""
app/schemas/message.py
──────────────────────
Pydantic schemas for Message (contact form) requests and admin responses.
"""
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class MessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=5000)


class MessageOut(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    is_read: bool


# ── Admin response (full message details) ────────────────────────────────────
class MessageAdminOut(BaseModel):
    """Full message row returned by admin listing."""
    model_config = {"from_attributes": True}

    id: int
    name: str
    email: str
    message: str
    created_at: datetime
    is_read: bool


# ── Admin input: patch ────────────────────────────────────────────────────────
class MessagePatch(BaseModel):
    """Body of ``PATCH /api/admin/messages/{id}``."""

    is_read: bool
