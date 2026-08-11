
from pydantic import BaseModel, Field


class SidebarItemOut(BaseModel):
    id: int
    slug: str
    label: str
    extension: str | None
    sort_order: int
    is_visible: bool
    has_icon: bool # We will compute this in the router based on icon_data
    
    class Config:
        from_attributes = True

class SidebarItemUpdate(BaseModel):
    label: str | None = Field(None, min_length=1)
    extension: str | None = None
    sort_order: int | None = None
    is_visible: bool | None = None
