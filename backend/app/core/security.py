"""
app/core/security.py
────────────────────
Password hashing (bcrypt via passlib) and JWT creation/verification (python-jose).
Route dependencies and auth service import from here.
"""
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ── Password hashing ──────────────────────────────────────────────────────────
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash of *plain_password*."""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if *plain_password* matches *hashed_password*."""
    return _pwd_context.verify(plain_password, hashed_password)


# ── JWT tokens ────────────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a signed JWT access token.

    Args:
        data: Payload dict (typically ``{"sub": str(user_id)}``).
        expires_delta: Optional custom expiry; defaults to settings value.

    Returns:
        Encoded JWT string.
    """
    payload = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.

    Raises:
        jose.JWTError: if the token is invalid or expired.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
