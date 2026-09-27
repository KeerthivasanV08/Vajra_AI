"""
Metrics & Validation Routes Module for VAJRA Platform.
Endpoints:
- GET /api/v1/metrics/models
- GET /api/v1/metrics/models/{model_id}
- GET /api/v1/metrics/overall
- GET /api/v1/metrics/fairness
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from app.ml.model_registry import model_registry
from app.services.vajra.validation_service import validation_service
from app.services.vajra.fairness_audit_service import fairness_audit_service

router = APIRouter()

@router.get("/metrics/models", summary="List evaluation metrics & audit statuses for all models")
def get_all_model_metrics():
    registry_data = model_registry.list_models()
    results = {}
    for mid, info in registry_data.items():
        metrics = validation_service.get_model_metrics(mid)
        results[mid] = {
            "model_info": info,
            "metrics": metrics,
            "audit_warning": info.get("audit_warning")
        }
    return {"models_count": len(results), "models": results}

@router.get("/metrics/models/{model_id}", summary="Get evaluation metrics for a specific model_id")
def get_model_metrics_by_id(model_id: str):
    info = model_registry.get_model_info(model_id)
    if not info:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found in registry.")
    metrics = validation_service.get_model_metrics(model_id)
    return {
        "model_id": model_id,
        "model_info": info,
        "metrics": metrics,
        "audit_warning": info.get("audit_warning")
    }

@router.get("/metrics/overall", summary="Get overall model comparison summary")
def get_overall_metrics():
    return validation_service.get_overall_summary()

@router.get("/metrics/fairness", summary="Get fairness governance metrics")
def get_fairness_metrics():
    return fairness_audit_service.get_fairness_summary()
