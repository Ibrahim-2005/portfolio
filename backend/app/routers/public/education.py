"""
app/routers/public/education.py
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.education import EducationOut
from app.services import education_service

router = APIRouter(prefix="/education", tags=["Education"])

@router.get("", response_model=list[EducationOut])
def get_education(db: Session = Depends(get_db)):
    """Retrieve all education records ordered by sort_order ascending."""
    return education_service.get_all(db)
