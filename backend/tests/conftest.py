"""
tests/conftest.py
─────────────────
Shared pytest fixtures for the backend test suite.

Uses an in-memory SQLite database, forced onto a single shared connection
via StaticPool so every thread (including FastAPI's threadpool for sync
routes) sees the same data — this is what actually solves cross-thread
visibility, not shared-cache URIs or manual truncation.

The ``ARRAY`` type on ``projects.tech_stack`` is PostgreSQL-only.
For SQLite tests a ``_JSONList`` TypeDecorator transparently stores lists as
JSON strings.
"""

import json

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import String, create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.types import TypeDecorator

from app.core.database import Base, get_db
from app.main import app as fastapi_app
import app.models as _models  # noqa: F401 — register all models on Base

# ── SQLite-compatible substitute for ARRAY(String) ───────────────────────────


class _JSONList(TypeDecorator):
    """Store a Python list as a JSON string in SQLite."""

    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return "[]"
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        return json.loads(value)


def _patch_array_columns() -> None:
    """Replace all ARRAY columns in Base.metadata with _JSONList."""
    from sqlalchemy import ARRAY

    for table in Base.metadata.tables.values():
        for col in table.columns:
            if isinstance(col.type, ARRAY):
                col.type = _JSONList()


# ── Test engine — single shared connection via StaticPool ────────────────────
# This is the fix: StaticPool means every session/thread reuses the exact
# same underlying connection, so an in-memory sqlite:// DB stays populated
# no matter which thread (main test thread or FastAPI's threadpool) touches it.
_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@event.listens_for(_engine, "connect")
def _enable_fk(dbapi_conn, _):
    dbapi_conn.execute("PRAGMA foreign_keys=ON")


_TestingSessionLocal = sessionmaker(bind=_engine, autocommit=False, autoflush=False)


# ── Session-scoped: patch ARRAY types once ────────────────────────────────────


@pytest.fixture(scope="session", autouse=True)
def _patch_types():
    _patch_array_columns()
    yield


# ── Function-scoped: fresh schema for every single test ──────────────────────


@pytest.fixture(autouse=True)
def _reset_db(_patch_types):
    """Drop and recreate all tables before every test — cheap and fully clean
    since StaticPool means this always happens on the one real connection."""
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


# ── Per-test DB session ────────────────────────────────────────────────────


@pytest.fixture
def db_session(_reset_db):
    session: Session = _TestingSessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@pytest_asyncio.fixture
async def client(db_session):
    """The route gets a fresh session too, but since it's the SAME connection
    (StaticPool), it sees whatever db_session has committed — no identity-map
    or cross-connection tricks needed."""

    def _override_get_db():
        route_session: Session = _TestingSessionLocal()
        try:
            yield route_session
        finally:
            route_session.close()

    fastapi_app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    fastapi_app.dependency_overrides.clear()
