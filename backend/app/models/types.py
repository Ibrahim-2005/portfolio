"""
Small SQLAlchemy type helpers shared by runtime models.
"""
from __future__ import annotations

import json

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.types import TypeDecorator


class StringList(TypeDecorator):
    """Store a list of strings as ARRAY on Postgres and JSON text elsewhere."""

    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(ARRAY(String))
        return dialect.type_descriptor(String)

    def process_bind_param(self, value, dialect):
        if value is None:
            value = []
        if dialect.name == "postgresql":
            return value
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        if dialect.name == "postgresql":
            return value
        if isinstance(value, list):
            return value
        return json.loads(value)
