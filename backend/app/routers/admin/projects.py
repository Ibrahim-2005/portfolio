"""
routers/admin/projects.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/projects", tags=["admin:projects"])
