"""
routers/admin/skills.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/skills", tags=["admin:skills"])
