"""
routers/admin/messages.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/messages", tags=["admin:messages"])
