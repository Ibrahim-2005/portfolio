import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.sidebar_item import SidebarItem
from app.schemas.sidebar import SidebarItemOut, SidebarItemUpdate
from app.services.cloudinary_service import cloudinary_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sidebar", tags=["admin:sidebar"])

MAX_ICON_SIZE = 2 * 1024 * 1024  # 2 MB limit for sidebar icons
ALLOWED_ICON_TYPES = ["image/png", "image/jpeg", "image/webp"]

@router.get("", response_model=list[SidebarItemOut])
def get_admin_sidebar_items(db: Session = Depends(get_db)):
    """
    Returns all sidebar items for admin management, ordered by sort_order.
    """
    items = db.query(SidebarItem).order_by(SidebarItem.sort_order.asc()).all()
    for item in items:
        item.has_icon = item.icon_data is not None or item.icon_url is not None
    return items

@router.patch("/{item_id}", response_model=SidebarItemOut)
def update_sidebar_item(item_id: int, data: SidebarItemUpdate, db: Session = Depends(get_db)):
    """
    Update a sidebar item. Slug cannot be updated.
    """
    item = db.query(SidebarItem).filter(SidebarItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Sidebar item not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    item.has_icon = item.icon_data is not None or item.icon_url is not None
    return item

@router.post("/{item_id}/icon", response_model=SidebarItemOut)
async def upload_sidebar_icon(
    item_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a custom icon for a sidebar item.
    """
    if file.content_type not in ALLOWED_ICON_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_ICON_TYPES)}"
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_ICON_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 2MB.")

    item = db.query(SidebarItem).filter(SidebarItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Sidebar item not found")

    old_public_id = item.icon_public_id

    # 1. Upload new image first
    secure_url, public_id = cloudinary_service.upload_image(file_bytes, "portfolio/sidebar/")

    # 2. Update database
    item.icon_url = secure_url
    item.icon_public_id = public_id

    db.commit()
    db.refresh(item)

    # 3. Only AFTER successful database update, delete the old Cloudinary asset
    if old_public_id:
        try:
            cloudinary_service.delete_image(old_public_id)
        except Exception as exc:
            logger.warning("Failed to delete old Cloudinary image: %s", exc)
    item.has_icon = True
    return item

@router.delete("/{item_id}/icon", response_model=SidebarItemOut)
def remove_sidebar_icon(item_id: int, db: Session = Depends(get_db)):
    """
    Remove the custom icon for a sidebar item, falling back to default.
    """
    item = db.query(SidebarItem).filter(SidebarItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Sidebar item not found")

    public_id = item.icon_public_id

    # Delete from Cloudinary
    if public_id:
        cloudinary_service.delete_image(public_id)

    # Update DB
    item.icon_url = None
    item.icon_public_id = None

    item.icon_data = None
    item.icon_mime = None
    
    db.commit()
    db.refresh(item)
    item.has_icon = False
    return item
