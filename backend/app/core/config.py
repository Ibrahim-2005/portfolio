"""
app/core/config.py
──────────────────
Application settings loaded from environment variables via pydantic-settings.
All configuration lives here; nothing else should read from os.environ directly.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Project-wide settings. Values are read from the .env file at startup."""

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT Auth ──────────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production-at-least-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins, e.g. "http://localhost:5500,https://example.com"
    ALLOWED_ORIGINS: str = "http://localhost:5500,http://127.0.0.1:5500"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        """Return ALLOWED_ORIGINS as a Python list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Module-level singleton — import this everywhere
settings = Settings()
