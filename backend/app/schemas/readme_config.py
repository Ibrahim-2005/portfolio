
from pydantic import BaseModel


class ReadmeConfigOut(BaseModel):
    id: int
    content: str | None = None

    class Config:
        from_attributes = True

class ReadmeConfigUpdate(BaseModel):
    content: str | None = None
