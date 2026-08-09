"""
app/models/skill_domain.py
──────────────────────────
Represents a category of skills (e.g. Backend, Frontend).
"""
from typing import List

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class SkillDomain(Base):
    __tablename__ = "skill_domains"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationship to Skills
    skills: Mapped[List["Skill"]] = relationship(
        "Skill",
        back_populates="domain",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<SkillDomain id={self.id} name={self.name!r}>"
