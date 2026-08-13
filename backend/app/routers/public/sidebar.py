
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.sidebar_item import SidebarItem
from app.schemas.sidebar import SidebarItemOut

router = APIRouter(prefix="/sidebar", tags=["public:sidebar"])

@router.get("", response_model=list[SidebarItemOut])
def get_sidebar_items(db: Session = Depends(get_db)):
    """
    Returns all visible sidebar items, ordered by sort_order.
    """
    items = (
        db.query(SidebarItem)
        .filter(SidebarItem.is_visible)
        .order_by(SidebarItem.sort_order.asc())
        .all()
    )
    
    # We map icon_data presence to has_icon boolean
    for item in items:
        item.has_icon = item.icon_data is not None or item.icon_url is not None
        
    return items

@router.get("/{item_id}/icon")
def get_sidebar_item_icon(item_id: int, db: Session = Depends(get_db)):
    """
    Returns the binary image data for a custom sidebar icon.
    """
    item = db.query(SidebarItem).filter(SidebarItem.id == item_id).first()
    if not item or not item.icon_data:
        raise HTTPException(status_code=404, detail="Icon not found")
        
    return Response(content=item.icon_data, media_type=item.icon_mime)
