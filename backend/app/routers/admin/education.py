"""
app/routers/admin/education.py
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.schemas.education import EducationOut, EducationCreate, EducationUpdate
from app.services import education_service

router = APIRouter(
    prefix="/education",
    tags=["Admin Education"],
)

@router.get("", response_model=List[EducationOut])
def get_education(db: Session = Depends(get_db)):
    """Retrieve all education records."""
    return education_service.get_all(db)

@router.post("", response_model=EducationOut, status_code=status.HTTP_201_CREATED)
def create_education(education_in: EducationCreate, db: Session = Depends(get_db)):
    """Create a new education record."""
    return education_service.create(db, education_in)

@router.put("/{edu_id}", response_model=EducationOut)
def update_education(edu_id: int, education_in: EducationUpdate, db: Session = Depends(get_db)):
    """Update an existing education record."""
    db_obj = education_service.get_by_id(db, edu_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Education record not found")
    return education_service.update(db, db_obj, education_in)

@router.delete("/{edu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(edu_id: int, db: Session = Depends(get_db)):
    """Delete an education record."""
    db_obj = education_service.get_by_id(db, edu_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Education record not found")
    education_service.delete(db, db_obj)
    return None
