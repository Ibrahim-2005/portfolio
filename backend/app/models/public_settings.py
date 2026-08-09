"""
app/models/public_settings.py
─────────────────────────────
Singleton configuration for the Public Settings panel.
"""
from sqlalchemy import Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PublicSettings(Base):
    __tablename__ = "public_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tech_stack_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    author_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<PublicSettings id={self.id}>"
