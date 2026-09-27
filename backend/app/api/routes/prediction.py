"""
Prediction Routes Module for VAJRA Platform.
Endpoints:
- POST /api/v1/prediction/cashout
- GET /api/v1/prediction/history
- GET /api/v1/prediction/{prediction_id}
- GET /api/v1/prediction/{prediction_id}/candidates
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query
from app.schemas.prediction import CashoutPredictionRequest, PhysicalPredictionResponse
from app.services.vajra.physical_prediction_service import physical_prediction_service
from app.repositories.prediction_repository import prediction_repository
from app.core.security import get_current_user

from app.core.sanitizer import sanitize_for_json

router = APIRouter()

@router.post("/prediction/cashout", response_model=PhysicalPredictionResponse, summary="Execute physical cash-out predictive intelligence pipeline")
def predict_cashout(req: CashoutPredictionRequest, user: dict = Depends(get_current_user)):
    result = physical_prediction_service.execute_physical_prediction(
        account_id=req.account_id,
        geo_lat=req.geo_lat,
        geo_lon=req.geo_lon,
        digital_risk_score=req.digital_risk_score or 0.70,
        mule_probability=req.mule_probability or 0.65,
        session_data=req.session_data
    )
    return sanitize_for_json(result)

@router.get("/prediction/history", summary="Get historical prediction queries")
def get_prediction_history(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=100)):
    items = prediction_repository.get_history(page=page, page_size=page_size)
    return sanitize_for_json({
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": len(items)
    })

@router.get("/prediction/{prediction_id}", summary="Get prediction details by prediction_id")
def get_prediction_by_id(prediction_id: str):
    pred = prediction_repository.get_prediction(prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail=f"Prediction '{prediction_id}' not found.")
    return pred

@router.get("/prediction/{prediction_id}/candidates", summary="Get candidate nodes for a prediction_id")
def get_prediction_candidates(prediction_id: str):
    pred = prediction_repository.get_prediction(prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail=f"Prediction '{prediction_id}' not found.")
    return {
        "prediction_id": prediction_id,
        "candidates_count": pred.get("candidates_count", 0),
        "candidates": pred.get("candidates", []),
        "top_candidates": pred.get("top_candidates", [])
    }
