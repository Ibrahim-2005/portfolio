"""
app/models/admin_user.py
────────────────────────
Single admin account record. Passwords are stored as bcrypt hashes —
never plaintext. No public registration; row is seeded manually or via seed.py.
"""
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AdminUser(Base):
    __tablename__ = "admin_user"

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # ── Fields ────────────────────────────────────────────────────────────────
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    def __repr__(self) -> str:
        return f"<AdminUser id={self.id} email={self.email!r}>"
