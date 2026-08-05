"""
create_admin.py
───────────────
One-off script to create (or update) the initial admin user.

Reads credentials from environment variables — never hardcoded:
    ADMIN_EMAIL     — admin login email
    ADMIN_PASSWORD  — plaintext password (will be bcrypt-hashed before storage)

Usage:
    # Set env vars first (or add to .env — the script loads it automatically)
    set ADMIN_EMAIL=admin@example.com
    set ADMIN_PASSWORD=supersecret
    python create_admin.py
"""
import os
import sys

from dotenv import load_dotenv

# Load .env so the script works the same way as the rest of the app
load_dotenv()

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.admin_user import AdminUser


def main() -> None:
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")

    if not email:
        print("ERROR: ADMIN_EMAIL environment variable is not set.", file=sys.stderr)
        sys.exit(1)
    if not password:
        print("ERROR: ADMIN_PASSWORD environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    hashed = hash_password(password)

    db = SessionLocal()
    try:
        existing = db.query(AdminUser).filter(AdminUser.email == email).first()

        if existing:
            existing.hashed_password = hashed
            action = "Updated"
        else:
            db.add(AdminUser(email=email, hashed_password=hashed))
            action = "Created"

        db.commit()
        print(f"{action} admin user: {email}")
    except Exception as exc:
        db.rollback()
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
