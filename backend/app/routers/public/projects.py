"""
routers/public/projects.py  — PUBLIC (unauthenticated)
Routes implemented in Phase 2.
"""
from fastapi import APIRouter

router = APIRouter(prefix="/projects", tags=["public:projects"])
