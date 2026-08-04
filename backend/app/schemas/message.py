"""
app/schemas/message.py
──────────────────────
Pydantic schemas for Message (contact form) requests and responses.
(Stub — full schemas implemented in Phase 2 alongside routers.)
"""
from pydantic import BaseModel


class MessageBase(BaseModel):
    pass


class MessageCreate(MessageBase):
    pass


class MessageOut(MessageBase):
    model_config = {"from_attributes": True}
