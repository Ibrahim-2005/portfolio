"""
routers/admin/guestbook.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/guestbook", tags=["admin:guestbook"])
