from typing import Any
from fastapi import APIRouter, Depends, Body, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import page_service

from app.schemas.readme_config import ReadmeConfigOut, ReadmeConfigUpdate
from app.schemas.certificates_config import CertificatesConfigOut, CertificatesConfigUpdate

router = APIRouter(prefix="/pages", tags=["admin:pages"])

@router.get("/readme", response_model=ReadmeConfigOut)
def get_admin_readme(db: Session = Depends(get_db)):
    instance = page_service.get_page_config(db, "readme")
    return ReadmeConfigOut.model_validate(instance)

@router.patch("/readme", response_model=ReadmeConfigOut)
def update_admin_readme(update_data: ReadmeConfigUpdate, db: Session = Depends(get_db)):
    instance = page_service.update_page_config(db, "readme", update_data)
    return ReadmeConfigOut.model_validate(instance)

@router.get("/certificates", response_model=CertificatesConfigOut)
def get_admin_certificates(db: Session = Depends(get_db)):
    instance = page_service.get_page_config(db, "certificates")
    return CertificatesConfigOut.model_validate(instance)

@router.patch("/certificates", response_model=CertificatesConfigOut)
def update_admin_certificates(update_data: CertificatesConfigUpdate, db: Session = Depends(get_db)):
    instance = page_service.update_page_config(db, "certificates", update_data)
    return CertificatesConfigOut.model_validate(instance)

@router.put("/{slug}")
async def update_page(slug: str, request: Request, db: Session = Depends(get_db)) -> Any:
    """Update the singleton configuration for a specific page."""
    # We dynamically parse the body into the correct Pydantic schema based on the slug
    update_schema_class = page_service.get_update_schema(slug)
    
    from pydantic import ValidationError
    from fastapi import HTTPException
    
    # Extract JSON body directly
    json_data = await request.json()
    try:
        update_data = update_schema_class(**json_data)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())
        
    instance = page_service.update_page_config(db, slug, update_data)
    out_schema = page_service.get_page_schema(slug)
    return out_schema.model_validate(instance)
