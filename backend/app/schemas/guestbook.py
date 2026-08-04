"""
app/schemas/guestbook.py
────────────────────────
Pydantic schemas for GuestbookEntry requests and responses.
(Stub — full schemas implemented in Phase 2 alongside routers.)
"""
from pydantic import BaseModel


class GuestbookEntryBase(BaseModel):
    pass


class GuestbookEntryCreate(GuestbookEntryBase):
    pass


class GuestbookEntryOut(GuestbookEntryBase):
    model_config = {"from_attributes": True}
