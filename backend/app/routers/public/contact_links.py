"""
app/routers/public/contact_links.py
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.contact_link import ContactLink
from app.schemas.contact_link import ContactLinkOut
from app.services import contact_link_service

router = APIRouter(prefix="/contact-links", tags=["Contact Links"])

@router.get("", response_model=list[ContactLinkOut])
def get_contact_links(db: Session = Depends(get_db)):
    """Retrieve enabled contact links ordered by sort_order and id ascending."""
    items = contact_link_service.get_all_public(db)
    for item in items:
        item.has_uploaded_icon = item.icon_data is not None or item.icon_url is not None
    return items

@router.get("/{link_id}/icon")
def get_contact_link_icon(link_id: int, db: Session = Depends(get_db)):
    """
    Returns the binary image data for a custom contact link icon.
    """
    item = db.query(ContactLink).filter(ContactLink.id == link_id).first()
    if not item or not item.icon_data:
        raise HTTPException(status_code=404, detail="Icon not found")

    return Response(content=item.icon_data, media_type=item.icon_mime)
