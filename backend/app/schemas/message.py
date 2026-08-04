"""
app/schemas/message.py
──────────────────────
Pydantic schemas for Message (contact form) requests.
"""
from pydantic import BaseModel, EmailStr, Field


class MessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=10, max_length=5000)


class MessageOut(BaseModel):
    model_config = {"from_attributes": True}
    
    id: int
    is_read: bool
