"""
SOP Routes Module for VAJRA Platform.
Endpoints:
- POST /api/v1/sop/evaluate
- GET /api/v1/sop/{case_id}
- GET /api/v1/sop/{case_id}/timeline
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from app.schemas.sop import SOPEvaluationRequest, SOPEvaluationResponse
from app.services.vajra.sop_fusion_service import sop_fusion_service

router = APIRouter()

@router.post("/sop/evaluate", response_model=SOPEvaluationResponse, summary="Evaluate SOP action tier using Model 6 weighted fusion & Isotonic calibration")
def evaluate_sop_tier(req: SOPEvaluationRequest):
    return sop_fusion_service.evaluate_sop(
        digital_score=req.digital_risk_score,
        physical_score=req.physical_prediction_score,
        context_score=req.context_score or 0.50,
        imminent_overseas_shift=req.imminent_overseas_shift or False,
        cross_border_risk_score=req.cross_border_risk_score or 0.0
    )

@router.get("/sop/{case_id}", summary="Get SOP evaluation state for a case")
def get_case_sop(case_id: str):
    # Lookup or default SOP evaluation
    return sop_fusion_service.evaluate_sop(
        digital_score=0.75,
        physical_score=0.82,
        context_score=0.60
    )

@router.get("/sop/{case_id}/timeline", summary="Get SOP decision timeline for a case")
def get_sop_timeline(case_id: str):
    return {
        "case_id": case_id,
        "timeline_events": [
            {"timestamp": "2026-09-27T08:00:00Z", "event": "SOP Evaluated", "tier": "RECOMMEND_HOLD"},
            {"timestamp": "2026-09-27T08:02:00Z", "event": "Cross-Border Override Triggered", "tier": "INTERNATIONAL_ALERT_OVERRIDE"}
        ]
    }
