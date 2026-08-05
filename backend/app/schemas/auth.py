"""
app/schemas/auth.py
───────────────────
Pydantic schemas for auth requests and JWT token responses.
"""
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Body of ``POST /api/auth/login``."""

    email: EmailStr
    password: str


class TokenOut(BaseModel):
    """Successful login response."""

    access_token: str
    token_type: str = "bearer"
