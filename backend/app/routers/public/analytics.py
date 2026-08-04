"""
routers/public/analytics.py  — PUBLIC (unauthenticated)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["public:analytics"])
