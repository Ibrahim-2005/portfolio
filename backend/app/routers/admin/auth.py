"""
routers/admin/auth.py
─────────────────────
Login endpoint — issues a short-lived JWT on successful credential verification.
Mounted under ``/api`` (not ``/api/admin``) so the route is ``POST /api/auth/login``.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, TokenOut
from app.services.auth_service import authenticate_admin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an admin user and return a JWT access token.

    - **200** — valid credentials → ``{"access_token": "...", "token_type": "bearer"}``
    - **401** — invalid email or password
    """
    admin = authenticate_admin(db, body.email, body.password)
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(admin.id)})
    return TokenOut(access_token=access_token)
