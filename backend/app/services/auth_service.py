"""
services/auth_service.py
────────────────────────
Business logic for admin authentication: credential verification, token issuance.
Implemented in Phase 2.
"""


def authenticate_admin(db, email: str, password: str):
    """Verify credentials and return the AdminUser row, or None on failure."""
    # TODO: Phase 2 implementation
    raise NotImplementedError


def get_current_admin(db, token: str):
    """Decode JWT and return the AdminUser row, raising 401 on failure."""
    # TODO: Phase 2 implementation
    raise NotImplementedError
