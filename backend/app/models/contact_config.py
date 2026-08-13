"""
app/models/contact_config.py
────────────────────────────
Singleton configuration for the Contact page header.
"""
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ContactConfig(Base):
    __tablename__ = "contact_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    top_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    heading: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tagline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    form_footer_text: Mapped[str | None] = mapped_column(String(255), nullable=True)

    def __repr__(self) -> str:
        return f"<ContactConfig id={self.id}>"
