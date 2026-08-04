"""
app/schemas/auth.py
───────────────────
Pydantic schemas for auth requests and JWT token responses.
(Stub — full schemas implemented in Phase 2 alongside routers.)
"""
from pydantic import BaseModel


class LoginRequest(BaseModel):
    pass


class TokenOut(BaseModel):
    pass
