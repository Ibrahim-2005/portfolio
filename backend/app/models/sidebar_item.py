from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, LargeBinary, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SidebarItem(Base):
    __tablename__ = "sidebar_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String, nullable=False)
    extension: Mapped[str | None] = mapped_column(String, nullable=True)
    icon_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    icon_mime: Mapped[str | None] = mapped_column(String, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<SidebarItem slug='{self.slug}' label='{self.label}'>"
