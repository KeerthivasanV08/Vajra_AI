"""
VAJRA Central Configuration Module.
Pydantic-based settings supporting environment variables with fallback defaults.
"""

import os
from pathlib import Path
from typing import List, Optional

REPO_ROOT = Path(__file__).resolve().parents[3]   # Vajra_AI/  (kept for images)
BACKEND_DIR = Path(__file__).resolve().parents[2]  # Vajra_AI/backend/

class Settings:
    APPLICATION_NAME: str = "VAJRA — Predictive Cybercrime Cash-Out Interception Platform"
    APPLICATION_VERSION: str = "2026.1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")
    API_PREFIX: str = "/api/v1"

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:8080")
    CORS_ORIGINS: List[str] = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ]

    # Data & Artifact Directories
    # DATA_ROOT anchors on BACKEND_DIR so the backend is self-contained:
    # - local dev:  Vajra_AI/backend/data/
    # - Render:     /opt/render/project/src/backend/data/
    DATA_ROOT: Path = BACKEND_DIR / "data"
    RAW_DATA_ROOT: Path = DATA_ROOT / "raw"
    PROCESSED_DATA_ROOT: Path = DATA_ROOT / "processed"
    REFERENCE_DATA_ROOT: Path = DATA_ROOT / "reference"

    MODEL_ROOT: Path = BACKEND_DIR / "models"
    EVALUATION_ROOT: Path = BACKEND_DIR / "evaluation"
    AUDIT_ROOT: Path = BACKEND_DIR / "audit"
    IMAGES_ROOT: Path = REPO_ROOT / "images"

    # Digital AML model paths
    LEGACY_MODEL_DIR: Path = BACKEND_DIR / "app" / "models"
    ONBOARDING_MODEL_PATH: Path = LEGACY_MODEL_DIR / "onboarding" / "onboarding_lightgbm.pkl"
    TRANSACTION_MODEL_PATH: Path = LEGACY_MODEL_DIR / "transaction" / "behavioral_lightgbm.pkl"

    # Database Configuration
    DATABASE_MODE: str = os.getenv("DATABASE_MODE", "csv")
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)

    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "vajra_db")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")

    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "neo4j_password")

    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "vajra_aml_super_secret_jwt_key_2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Cryptographic Audit
    AUDIT_HASH_ALGORITHM: str = "sha256"

    # Spatial & Geofence
    MAP_PROVIDER: str = os.getenv("MAP_PROVIDER", "leaflet_osm")
    H3_RESOLUTION: int = int(os.getenv("H3_RESOLUTION", "7"))

    # Feature Toggles
    ENABLE_EXTERNAL_DISPATCH: bool = os.getenv("ENABLE_EXTERNAL_DISPATCH", "False").lower() in ("true", "1", "t")
    ENABLE_BANK_ACTIONS: bool = os.getenv("ENABLE_BANK_ACTIONS", "False").lower() in ("true", "1", "t")
    ENABLE_LEGAL_DOSSIER: bool = os.getenv("ENABLE_LEGAL_DOSSIER", "True").lower() in ("true", "1", "t")
    ENABLE_SIMULATION: bool = os.getenv("ENABLE_SIMULATION", "True").lower() in ("true", "1", "t")

    # Mode
    SYNTHETIC_DATA_MODE: bool = os.getenv("SYNTHETIC_DATA_MODE", "True").lower() in ("true", "1", "t")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    def __init__(self) -> None:
        raw_origins = os.getenv("FRONTEND_ORIGINS")
        if raw_origins:
            self.CORS_ORIGINS = [s.strip() for s in raw_origins.split(",") if s.strip()]
        self.FRONTEND_ORIGINS = self.CORS_ORIGINS

settings = Settings()

# ─── SOP Fusion Weights ────────────────────────────────────────────────────
# Weighted sum: 0.45 * Digital + 0.35 * Physical + 0.20 * Context
# Cross-border override is ISOLATED — not included in this weighted sum.
W_DIGITAL: float = 0.45
W_PHYSICAL: float = 0.35
W_CONTEXT: float = 0.20