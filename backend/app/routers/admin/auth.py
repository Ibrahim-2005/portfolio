"""
routers/admin/auth.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["admin:auth"])
