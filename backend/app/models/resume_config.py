"""
app/models/resume_config.py
───────────────────────────
Singleton configuration for the Resume page.
"""
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ResumeConfig(Base):
    __tablename__ = "resume_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    top_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    heading: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tagline: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(512), nullable=True)

    def __repr__(self) -> str:
        return f"<ResumeConfig id={self.id}>"
