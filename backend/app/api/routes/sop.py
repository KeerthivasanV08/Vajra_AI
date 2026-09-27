"""
SOP Routes Module for VAJRA Platform.
Endpoints:
- POST /api/v1/sop/evaluate
- GET /api/v1/sop/{case_id}
- GET /api/v1/sop/{case_id}/timeline
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.sop import SOPEvaluationRequest, SOPEvaluationResponse, SOPSimulationRequest, SOPFusionResponse
from app.services.vajra.sop_fusion_service import sop_fusion_service
from app.repositories.sop_fusion_repository import sop_fusion_repository
from app.services.audit.audit_chain_service import audit_chain_service
from app.core.security import get_current_user

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


@router.post("/sop/simulate", response_model=SOPFusionResponse, summary="Calculate an unsaved SOP what-if scenario")
def simulate_sop(req: SOPSimulationRequest):
    return sop_fusion_service.simulate(req.digital, req.physical, req.context, req.cross_border_override)


@router.get("/sop/case/{case_id}/fusion", response_model=SOPFusionResponse, summary="Read stored SOP signals for a case")
def get_case_fusion(case_id: str):
    result = sop_fusion_service.case_fusion(case_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Stored SOP signal values are unavailable for this case")
    return result


@router.post("/sop/case/{case_id}/apply-simulation", response_model=SOPFusionResponse, summary="Apply a simulation to a case")
def apply_simulation(case_id: str, req: SOPSimulationRequest, user: dict = Depends(get_current_user)):
    if not sop_fusion_service.case_fusion(case_id):
        raise HTTPException(status_code=404, detail="Case or stored SOP signal values not found")
    result = sop_fusion_service.simulate(req.digital, req.physical, req.context, req.cross_border_override)
    from datetime import datetime, timezone
    now = result["calculated_at"] = datetime.now(timezone.utc).isoformat()
    record = sop_fusion_repository.append({
        "case_id": case_id,
        "digital_score": req.digital,
        "physical_score": req.physical,
        "context_score": req.context,
        "cross_border_override": req.cross_border_override,
        "raw_fusion_score": result["raw_score"],
        "calibrated_score": result["calibrated_score"],
        "tier_assigned": result["tier"],
        "calculated_at": now,
        "calculation_source": "applied",
    })
    audit_chain_service.append_event(
        action_type="SOP_SIMULATION_APPLIED",
        target_entity=case_id,
        payload=record,
        officer_id=user.get("user_id", "OFFICER_001_DEFAULT"),
    )
    result["case_id"] = case_id
    return result
