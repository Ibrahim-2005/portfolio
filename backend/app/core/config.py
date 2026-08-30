"""
app/core/config.py
──────────────────
Application settings loaded from environment variables via pydantic-settings.
All configuration lives here; nothing else should read from os.environ directly.
"""
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Project-wide settings. Values are read from the .env file at startup."""

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT Auth ──────────────────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or len(v.strip()) < 32:
            raise ValueError("SECRET_KEY must be provided via environment and be at least 32 characters long")
        return v

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins, supplied strictly via environment
    # (.env for local development, environment variables for production).
    # Never hardcoded with localhost or wildcard "*" in application code.
    ALLOWED_ORIGINS: str = ""

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def validate_allowed_origins(cls, v: str) -> str:
        if v:
            for item in v.split(","):
                if item.strip() == "*":
                    raise ValueError("ALLOWED_ORIGINS cannot contain wildcard '*' when credentialed CORS is enabled")
        return v

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
        """Return ALLOWED_ORIGINS as a Python list with stripped whitespace and normalized URLs."""
        if not self.ALLOWED_ORIGINS:
            return []
        origins = []
        for origin in self.ALLOWED_ORIGINS.split(","):
            cleaned = origin.strip().rstrip("/")
            if cleaned and cleaned != "*":
                origins.append(cleaned)
        return origins


# Module-level singleton — import this everywhere
settings = Settings()
