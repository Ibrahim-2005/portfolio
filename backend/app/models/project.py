"""
app/models/project.py
─────────────────────
One row per featured project. tech_stack stored as a Postgres ARRAY(String)
(v1 — no join table needed until per-tech filtering is required).
"""
from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.types import StringList


class Project(Base):
    __tablename__ = "projects"

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────────────────
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    tech_stack: Mapped[list[str]] = mapped_column(
        StringList,
        nullable=False,
        default=list,
    )
    repo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    live_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    highlights: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    def __repr__(self) -> str:
        return f"<Project id={self.id} title={self.title!r}>"
