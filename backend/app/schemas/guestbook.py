"""
app/schemas/guestbook.py
────────────────────────
Pydantic schemas for GuestbookEntry requests.
"""
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
