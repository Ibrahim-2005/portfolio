"""
routers/admin/sections.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/sections", tags=["admin:sections"])
