"""
app/models/home_config.py
─────────────────────────
Singleton configuration for the Home page.
"""
from sqlalchemy import Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base


class HomeConfig(Base):
    __tablename__ = "home_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    top_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tagline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    intro: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Stored as JSON, default to empty list
    roles: Mapped[list[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=False, default=list)
    social_links: Mapped[list[dict]] = mapped_column(JSON().with_variant(JSONB, "postgresql"), nullable=False, default=list)

    action_projects_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    action_about_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    action_contact_label: Mapped[str | None] = mapped_column(String(255), nullable=True)

    def __repr__(self) -> str:
        return f"<HomeConfig id={self.id}>"
