"""
app/routers/public/contact_links.py
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.contact_link import ContactLinkOut
from app.services import contact_link_service

router = APIRouter(prefix="/contact-links", tags=["Contact Links"])

@router.get("", response_model=List[ContactLinkOut])
def get_contact_links(db: Session = Depends(get_db)):
    """Retrieve enabled contact links ordered by sort_order and id ascending."""
    return contact_link_service.get_all_public(db)
