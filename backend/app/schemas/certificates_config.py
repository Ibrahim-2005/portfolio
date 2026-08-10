
from pydantic import BaseModel


class CertificatesConfigOut(BaseModel):
    id: int
    content: str | None = None

    class Config:
        from_attributes = True

class CertificatesConfigUpdate(BaseModel):
    content: str | None = None
