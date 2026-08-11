from typing import Optional
from pydantic import BaseModel, Field

class SidebarItemOut(BaseModel):
    id: int
    slug: str
    label: str
    extension: Optional[str]
    sort_order: int
    is_visible: bool
    has_icon: bool # We will compute this in the router based on icon_data
    
    class Config:
        from_attributes = True

class SidebarItemUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=1)
    extension: Optional[str] = None
    sort_order: Optional[int] = None
    is_visible: Optional[bool] = None
