"""
app/models/about_config.py
──────────────────────────
Singleton configuration for the About page.
"""
from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base


class AboutConfig(Base):
    __tablename__ = "about_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    top_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    big_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    tagline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    about_me: Mapped[str | None] = mapped_column(Text, nullable=True)

    current_focus: Mapped[list[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=False, default=list)
    currently_learning: Mapped[list[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=False, default=list)

    def __repr__(self) -> str:
        return f"<AboutConfig id={self.id}>"
