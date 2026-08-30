"""
app/core/config.py
──────────────────
Application settings loaded from environment variables via pydantic-settings.
All configuration lives here; nothing else should read from os.environ directly.
"""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Project-wide settings. Values are read from the .env file at startup."""

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT Auth ──────────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-at-least-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins, supplied strictly via environment
    # (.env for local development, environment variables for production).
    # Never hardcoded with localhost or wildcard "*" in application code.
    ALLOWED_ORIGINS: str = ""

    # ── Assets ────────────────────────────────────────────────────────────────
    RESUME_FILE_PATH: str = "../frontend/assets/resume/Mohamed_ IbrahimY_ Resume.pdf"

    # ── Cloudinary ────────────────────────────────────────────────────────────
    CLOUDINARY_CLOUD_NAME: str | None = None
    CLOUDINARY_API_KEY: str | None = None
    CLOUDINARY_API_SECRET: str | None = None

    # ── GitHub Integration ───────────────────────────────────────────────────
    GITHUB_REPO: str = "Ibrahim-2005/portfolio"
    GITHUB_TOKEN: str | None = None

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        """Return ALLOWED_ORIGINS as a Python list with stripped whitespace."""
        if not self.ALLOWED_ORIGINS:
            return []
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


# Module-level singleton — import this everywhere
settings = Settings()
