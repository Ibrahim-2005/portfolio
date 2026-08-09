from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import page_service

router = APIRouter(prefix="/pages", tags=["public:pages"])

@router.get("/{slug}")
def get_page(slug: str, db: Session = Depends(get_db)) -> Any:
    """Fetch the singleton configuration for a specific page."""
    instance = page_service.get_page_config(db, slug)
    out_schema = page_service.get_page_schema(slug)
    return out_schema.model_validate(instance)
