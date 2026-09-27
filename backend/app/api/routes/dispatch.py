"""
Dispatch Routes Module for VAJRA Platform.
Endpoints:
- POST /api/v1/dispatch/pcr
- POST /api/v1/dispatch/bank-stepup
- GET /api/v1/dispatch/{dispatch_id}
- GET /api/v1/dispatch
- POST /api/v1/dispatch/{dispatch_id}/acknowledge
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from app.schemas.dispatch import PCRDispatchRequest, BankStepUpRequest, DispatchResponse
from app.services.operations.dispatch_service import dispatch_service
from app.services.audit.audit_chain_service import audit_chain_service
from app.core.security import get_current_user

router = APIRouter()

@router.post("/dispatch/pcr", response_model=DispatchResponse, summary="Issue PCR Patrol Dispatch recommendation")
def dispatch_pcr(req: PCRDispatchRequest, user: dict = Depends(get_current_user)):
    officer_id = user.get("user_id", "OFFICER_001_DEFAULT")
    res = dispatch_service.create_pcr_dispatch(
        case_id=req.case_id,
        prediction_id=req.prediction_id,
        target_node_id=req.target_node_id,
        target_lat=req.target_lat,
        target_lon=req.target_lon,
        requested_by=officer_id
    )

    # Append cryptographic audit event
    audit_chain_service.append_event(
        action_type="PCR_PATROL_DISPATCHED",
        target_entity=res["dispatch_id"],
        payload=res,
        officer_id=officer_id
    )

    return res

@router.post("/dispatch/bank-stepup", response_model=DispatchResponse, summary="Issue Bank Step-Up recommendation")
def dispatch_bank_stepup(req: BankStepUpRequest, user: dict = Depends(get_current_user)):
    officer_id = user.get("user_id", "OFFICER_001_DEFAULT")
    res = dispatch_service.create_bank_stepup(
        account_id=req.account_id,
        case_id=req.case_id,
        requested_by=officer_id
    )

    # Append cryptographic audit event
    audit_chain_service.append_event(
        action_type="BANK_STEPUP_DISPATCHED",
        target_entity=res["dispatch_id"],
        payload=res,
        officer_id=officer_id
    )

    return res

@router.get("/dispatch", summary="List dispatches with pagination")
def list_dispatches(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=100)):
    items = dispatch_service.list_dispatches(page=page, page_size=page_size)
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": len(items)
    }

@router.get("/dispatch/{dispatch_id}", summary="Get dispatch details by dispatch_id")
def get_dispatch_by_id(dispatch_id: str):
    disp = dispatch_service.get_dispatch(dispatch_id)
    if not disp:
        raise HTTPException(status_code=404, detail=f"Dispatch '{dispatch_id}' not found.")
    return disp

@router.post("/dispatch/{dispatch_id}/acknowledge", summary="Acknowledge dispatch")
def acknowledge_dispatch(dispatch_id: str, user: dict = Depends(get_current_user)):
    officer_id = user.get("user_id", "OFFICER_001_DEFAULT")
    disp = dispatch_service.acknowledge_dispatch(dispatch_id, officer_id)
    if not disp:
        raise HTTPException(status_code=404, detail=f"Dispatch '{dispatch_id}' not found.")

    audit_chain_service.append_event(
        action_type="DISPATCH_ACKNOWLEDGED",
        target_entity=dispatch_id,
        payload={"dispatch_id": dispatch_id, "acknowledged_by": officer_id},
        officer_id=officer_id
    )

    return disp
