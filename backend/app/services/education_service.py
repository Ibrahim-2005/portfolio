"""
app/services/education_service.py
"""
from typing import Sequence
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.education import Education
from app.schemas.education import EducationCreate, EducationUpdate

def get_all(db: Session) -> Sequence[Education]:
    return db.scalars(
        select(Education).order_by(Education.sort_order.asc())
    ).all()

def get_by_id(db: Session, edu_id: int) -> Education | None:
    return db.get(Education, edu_id)

def create(db: Session, obj_in: EducationCreate) -> Education:
    db_obj = Education(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, db_obj: Education, obj_in: EducationUpdate) -> Education:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(db: Session, db_obj: Education) -> None:
    db.delete(db_obj)
    db.commit()
