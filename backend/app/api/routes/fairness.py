"""
Fairness Audit Routes Module for VAJRA Platform.
Endpoints:
- GET /api/v1/fairness-audit
- GET /api/v1/fairness-audit/groups
- GET /api/v1/fairness-audit/summary
"""

from fastapi import APIRouter
from app.services.vajra.fairness_audit_service import fairness_audit_service

router = APIRouter()

@router.get("/fairness-audit", summary="Get complete Model 7 fairness & bias governance audit")
def get_fairness_audit():
    return fairness_audit_service.get_fairness_summary()

@router.get("/fairness-audit/groups", summary="Get regional groups disparate impact summary")
def get_fairness_groups():
    summary = fairness_audit_service.get_fairness_summary()
    return {
        "groups_count": summary.get("analyzed_groups_count", 0),
        "groups": summary.get("groups", [])
    }

@router.get("/fairness-audit/summary", summary="Get fairness governance summary metrics")
def get_fairness_summary_metrics():
    summary = fairness_audit_service.get_fairness_summary()
    return {
        "is_non_scoring_governance_layer": True,
        "analyzed_groups_count": summary.get("analyzed_groups_count", 0),
        "disparate_impact_disclaimer": summary.get("disparate_impact_disclaimer")
    }
