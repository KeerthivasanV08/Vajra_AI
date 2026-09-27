"""
Fairness Audit Routes Module for VAJRA Platform.
Endpoints:
- GET /api/v1/fairness-audit
- GET /api/v1/fairness-audit/groups
- GET /api/v1/fairness-audit/summary
"""

from fastapi import APIRouter, Depends, HTTPException
from app.core.security import RoleChecker
from app.services.audit.audit_chain_service import audit_chain_service
from app.services.vajra.fairness_audit_service import fairness_audit_service

router = APIRouter()

@router.get("/fairness/regions", summary="Get persisted regional fairness statistics")
def get_fairness_regions():
    rows = fairness_audit_service.get_region_rows()
    return fairness_audit_service._response(rows)

@router.get("/fairness/regions/{region_id}/detail", summary="Get auditable regional fairness detail")
def get_fairness_region_detail(region_id: str):
    detail = fairness_audit_service.get_region_detail(region_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Fairness region '{region_id}' not found.")
    return detail

@router.post("/fairness/regions/recalculate", summary="Recalculate and persist regional fairness snapshot")
def recalculate_fairness_regions(user: dict = Depends(RoleChecker(["AUDITOR", "ADMIN"]))):
    result = fairness_audit_service.recalculate_regions()
    audit_chain_service.append_event(
        "FAIRNESS_SNAPSHOT_RECALCULATED",
        "MODEL_7_FAIRNESS",
        {"groups": result["analyzed_groups_count"], "artifact": result["data_provenance"]["artifact"]},
        str(user.get("user_id", "")),
    )
    return result

@router.get("/fairness-audit", summary="Get complete Model 7 fairness & bias governance audit")
def get_fairness_audit():
    return fairness_audit_service.get_fairness_summary()

@router.get("/fairness-audit/groups", summary="Get regional groups disparate impact summary")
def get_fairness_groups():
    summary = get_fairness_regions()
    return {
        "groups_count": summary.get("analyzed_groups_count", 0),
        "groups": summary.get("results", [])
    }

@router.get("/fairness-audit/summary", summary="Get fairness governance summary metrics")
def get_fairness_summary_metrics():
    summary = fairness_audit_service.get_fairness_summary()
    return {
        "is_non_scoring_governance_layer": summary.get("governance_boundary") == "NON_SCORING_DIAGNOSTIC",
        "analyzed_groups_count": summary.get("analyzed_groups_count", 0),
        "data_provenance": summary.get("data_provenance"),
        "disparate_impact_methodology": summary.get("disparate_impact_methodology"),
    }
