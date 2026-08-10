from pydantic import BaseModel
from typing import Optional

class CertificatesConfigOut(BaseModel):
    id: int
    content: Optional[str] = None

    class Config:
        from_attributes = True

class CertificatesConfigUpdate(BaseModel):
    content: Optional[str] = None
