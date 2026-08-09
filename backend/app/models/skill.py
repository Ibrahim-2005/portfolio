"""
app/models/skill.py
───────────────────
Skills grouped by category (e.g. "Backend", "Frontend", "Tools"),
ordered within each category by sort_order.
"""
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.skill_domain import SkillDomain


class Skill(Base):
    __tablename__ = "skills"

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────────────────
    domain_id: Mapped[int | None] = mapped_column(ForeignKey("skill_domains.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # 0-100 scale
    proficiency: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    # Legacy field preserved temporarily for migration compatibility if needed
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # ── Relationships ─────────────────────────────────────────────────────────
    domain: Mapped["SkillDomain"] = relationship(
        "SkillDomain",
        back_populates="skills"
    )

    def __repr__(self) -> str:
        return f"<Skill id={self.id} name={self.name!r}>"
