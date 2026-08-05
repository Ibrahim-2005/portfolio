"""
app/core/security.py
────────────────────
Password hashing (bcrypt via passlib) and JWT creation/verification (python-jose).
Route dependencies and auth service import from here.
"""
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

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


# ── OAuth2 scheme (tells OpenAPI where the login endpoint lives) ──────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── FastAPI dependency — protects admin routes ────────────────────────────────
def get_current_admin_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(None),  # overridden below at import time
):
    """
    Validate the JWT from the ``Authorization: Bearer <token>`` header
    and return the corresponding ``AdminUser`` row.

    Raises ``HTTPException(401)`` if the token is missing, expired, malformed,
    or refers to a user that no longer exists.

    **Note:** The ``db`` default (``Depends(None)``) is replaced by the actual
    ``get_db`` dependency via :func:`_wire_db_dependency` to avoid a circular
    import between ``security`` and ``database``.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    from app.models.admin_user import AdminUser  # deferred to avoid circular import

    admin = db.get(AdminUser, int(user_id))
    if admin is None:
        raise credentials_exception

    return admin


def _wire_db_dependency() -> None:
    """
    Replace the placeholder ``Depends(None)`` on :func:`get_current_admin_user`
    with ``Depends(get_db)`` once both modules are importable.

    Called once at app startup from ``main.py``.
    """
    import inspect

    from app.core.database import get_db

    sig = inspect.signature(get_current_admin_user)
    params = list(sig.parameters.values())

    new_params = []
    for p in params:
        if p.name == "db":
            new_params.append(
                p.replace(default=Depends(get_db))
            )
        else:
            new_params.append(p)

    get_current_admin_user.__signature__ = sig.replace(parameters=new_params)
