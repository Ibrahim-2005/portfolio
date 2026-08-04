"""
alembic/env.py
──────────────
Custom Alembic environment that:
  1. Reads DATABASE_URL from .env — creates an engine directly so configparser
     never sees the URL (avoids the %xx percent-encoding interpolation bug).
  2. Imports all models via app.models so autogenerate finds every table.
  3. Supports both online and offline migration modes.
"""
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import create_engine, pool

# ── sys.path: add backend/ so `app.*` imports resolve ────────────────────────
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

# ── Load .env before importing app modules ────────────────────────────────────
from dotenv import load_dotenv  # noqa: E402

load_dotenv(_BACKEND_DIR / ".env")

# ── Import declarative Base + register all models ─────────────────────────────
from app.core.database import Base  # noqa: E402
import app.models  # noqa: E402, F401

# ── Alembic Config object ─────────────────────────────────────────────────────
config = context.config

# Set up logging from the ini file (but don't write the URL into config —
# that would go through configparser and break on %-encoded chars).
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Metadata autogenerate inspects ───────────────────────────────────────────
target_metadata = Base.metadata

# ── Get the URL directly from the environment (never via configparser) ────────
DATABASE_URL: str = os.environ["DATABASE_URL"]


# ── Offline mode ──────────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    """Emit SQL to stdout without a live connection."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online mode ───────────────────────────────────────────────────────────────
def run_migrations_online() -> None:
    """Run migrations against the live Supabase / PostgreSQL database."""
    connectable = create_engine(DATABASE_URL, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
