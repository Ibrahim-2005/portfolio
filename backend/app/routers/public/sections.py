"""
routers/public/sections.py  — PUBLIC (unauthenticated)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/sections", tags=["public:sections"])
