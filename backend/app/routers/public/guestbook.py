"""
routers/public/guestbook.py  — PUBLIC (unauthenticated)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/guestbook", tags=["public:guestbook"])
