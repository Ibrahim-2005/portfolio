"""
app/models/section.py
─────────────────────
The backbone of the VS Code-style sidebar file tree.
Self-referencing via parent_id to support folder/page nesting.
"""
from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Section(Base):
    __tablename__ = "sections"

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────────────────
    slug: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # "page" | "folder"
    type: Mapped[str] = mapped_column(String(50), nullable=False, default="page")
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # Markdown or structured JSON depending on type
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # ── Self-referencing FK ───────────────────────────────────────────────────
    parent_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("sections.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    parent: Mapped["Section | None"] = relationship(
        "Section",
        back_populates="children",
        remote_side="Section.id",
    )
    children: Mapped[list["Section"]] = relationship(
        "Section",
        back_populates="parent",
        cascade="all, delete-orphan",
        order_by="Section.sort_order",
    )

    # ── Explicit indices ──────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_sections_slug", "slug", unique=True),
        Index("ix_sections_parent_id", "parent_id"),
    )

    def __repr__(self) -> str:
        return f"<Section id={self.id} slug={self.slug!r} type={self.type!r}>"
