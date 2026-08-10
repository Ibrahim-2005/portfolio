"""
app/routers/admin/contact_links.py
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.contact_link import (
    ContactLinkCreate,
    ContactLinkOut,
    ContactLinkUpdate,
)
from app.services import contact_link_service

router = APIRouter(
    prefix="/contact-links",
    tags=["Admin Contact Links"],
)

@router.get("", response_model=list[ContactLinkOut])
def get_contact_links(db: Session = Depends(get_db)):
    """Retrieve all contact links."""
    return contact_link_service.get_all_admin(db)

@router.post("", response_model=ContactLinkOut, status_code=status.HTTP_201_CREATED)
def create_contact_link(link_in: ContactLinkCreate, db: Session = Depends(get_db)):
    """Create a new contact link."""
    return contact_link_service.create(db, link_in)

@router.put("/{link_id}", response_model=ContactLinkOut)
def update_contact_link(link_id: int, link_in: ContactLinkUpdate, db: Session = Depends(get_db)):
    """Update an existing contact link."""
    db_obj = contact_link_service.get_by_id(db, link_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Contact link not found")
    return contact_link_service.update(db, db_obj, link_in)

@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_link(link_id: int, db: Session = Depends(get_db)):
    """Delete a contact link."""
    db_obj = contact_link_service.get_by_id(db, link_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Contact link not found")
    
    contact_link_service.delete(db, db_obj)
