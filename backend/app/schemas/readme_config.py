from pydantic import BaseModel
from typing import Optional

class ReadmeConfigOut(BaseModel):
    id: int
    content: Optional[str] = None

    class Config:
        from_attributes = True

class ReadmeConfigUpdate(BaseModel):
    content: Optional[str] = None
