"""
seed/seed.py
────────────
Entrypoint script: connects to the DB and inserts seed data from seed_content.py.
Run with:  python -m app.seed.seed

Implemented in Phase 3 (after routes exist and content is finalised).
"""
import sys

from app.core.database import SessionLocal


def main() -> None:
    print("Seed script not yet implemented — Phase 3.")
    sys.exit(0)


if __name__ == "__main__":
    main()
