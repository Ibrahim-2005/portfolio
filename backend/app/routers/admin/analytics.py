"""
routers/admin/analytics.py  — ADMIN (JWT-protected)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["admin:analytics"])
