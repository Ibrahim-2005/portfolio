"""
app/models/skill.py
───────────────────
Skills grouped by category (e.g. "Backend", "Frontend", "Tools"),
ordered within each category by sort_order.
"""
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Skill(Base):
    __tablename__ = "skills"

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────────────────
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    # e.g. "beginner" | "intermediate" | "advanced" | "expert"
    proficiency: Mapped[str] = mapped_column(String(50), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    def __repr__(self) -> str:
        return f"<Skill id={self.id} name={self.name!r} category={self.category!r}>"
