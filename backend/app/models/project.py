"""
app/models/project.py

One row per featured project.
tech_stack is stored as structured JSON:
[
    {"name": "FastAPI", "icon": "fa-bolt"},
    {"name": "PostgreSQL", "icon": "fa-database"}
]
"""

from sqlalchemy import Boolean, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────────────────
    title: Mapped[str] = mapped_column(String(255), nullable=False)

    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Phase 3: structured JSON tech stack
    tech_stack: Mapped[list[dict]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=False,
        default=list,
    )

    repo_url: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )

    live_url: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )

    highlights: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # CMS-only metadata
    featured: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    def __repr__(self) -> str:
        return f"<Project id={self.id} title={self.title!r}>"
