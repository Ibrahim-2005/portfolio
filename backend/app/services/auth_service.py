"""
services/auth_service.py
────────────────────────
Business logic for admin authentication: credential verification, token issuance.
"""
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.admin_user import AdminUser


def authenticate_admin(db: Session, email: str, password: str) -> AdminUser | None:
    """
    Verify credentials and return the ``AdminUser`` row, or ``None`` on failure.

    Performs a constant-time bcrypt comparison even when the email doesn't exist
    (passlib handles that internally) — no timing side-channel.
    """
    admin = db.query(AdminUser).filter(AdminUser.email == email).first()
    if admin is None:
        return None
    if not verify_password(password, admin.hashed_password):
        return None
    return admin
