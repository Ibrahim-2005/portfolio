"""
app/models/resume_file.py
─────────────────────────
Stores the uploaded resume PDF binary to avoid ephemeral storage issues.
"""
from sqlalchemy import Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ResumeFile(Base):
    __tablename__ = "resume_file"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)

    def __repr__(self) -> str:
        return f"<ResumeFile id={self.id} filename='{self.filename}'>"
