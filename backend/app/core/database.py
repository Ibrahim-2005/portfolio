"""
app/core/database.py
────────────────────
SQLAlchemy engine, session factory, declarative base, and FastAPI dependency.
All models import Base from here; nothing creates its own engine.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# ── Engine ────────────────────────────────────────────────────────────────────
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping keeps idle connections from going stale on Supabase/Render
    pool_pre_ping=True,
    # Echo SQL to stdout only in debug scenarios; set via env override if needed
    echo=False,
)

# ── Session factory ───────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


# ── Declarative base ─────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Shared declarative base.  Every model inherits from this."""


# ── FastAPI dependency ────────────────────────────────────────────────────────
def get_db() -> Session:  # type: ignore[return]
    """
    Yield a database session for a single request, then close it.

    Usage in a route::

        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
