"""
Health Routes Module for VAJRA Platform.
Endpoints: GET /api/v1/health, GET /api/v1/health/ready, GET /api/v1/health/models
"""

from fastapi import APIRouter
from app.core.config import settings
from app.ml.model_loader import model_loader

router = APIRouter()

@router.get("/health", summary="Basic service health check")
def get_health():
    return {
        "status": "ok",
        "service": settings.APPLICATION_NAME,
        "version": settings.APPLICATION_VERSION,
        "environment": settings.ENVIRONMENT
    }

@router.get("/health/ready", summary="Service readiness check")
def get_readiness():
    m_health = model_loader.check_health()
    return {
        "ready": m_health["all_healthy"],
        "database_mode": settings.DATABASE_MODE,
        "models_ready": m_health["all_healthy"],
        "synthetic_data_mode": settings.SYNTHETIC_DATA_MODE
    }

@router.get("/health/models", summary="Individual model artifact health status")
def get_model_health():
    m_health = model_loader.check_health()
    return {
        "all_healthy": m_health["all_healthy"],
        "models": {
            "trajectory": m_health["models_status"].get("trajectory", False),
            "node_vulnerability": m_health["models_status"].get("node_vulnerability", False),
            "spatial_region": m_health["models_status"].get("spatial_region", False),
            "node_ranker": m_health["models_status"].get("node_ranker", False),
            "cross_border": m_health["models_status"].get("cross_border", False),
            "sop_calibrator": m_health["models_status"].get("sop_calibrator", False),
            "syndicate_matcher": m_health["models_status"].get("syndicate_matcher", False)
        }
    }
