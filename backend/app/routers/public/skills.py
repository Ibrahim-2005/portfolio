"""
routers/public/skills.py  — PUBLIC (unauthenticated)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/skills", tags=["public:skills"])
