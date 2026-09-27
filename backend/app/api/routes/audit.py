"""
Audit Chain Routes Module for VAJRA Platform.
Endpoints:
- GET /api/v1/audit/chain
- GET /api/v1/audit/events
- GET /api/v1/audit/events/{event_id}
- POST /api/v1/audit/reverify
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.audit import ReverifyAuditResponse
from app.services.audit.audit_chain_service import audit_chain_service
from app.core.security import get_current_user

router = APIRouter()

@router.get("/audit/chain", summary="Get complete cryptographic audit ledger chain")
def get_audit_chain():
    chain = audit_chain_service.get_chain()
    return {
        "events_count": len(chain),
        "chain": chain
    }

@router.get("/audit/events", summary="List audit events")
def list_audit_events():
    events = audit_chain_service.get_chain()
    return {
        "total": len(events),
        "events": events
    }

@router.get("/audit/events/{event_id}", summary="Get audit event by event_id")
def get_audit_event(event_id: str):
    ev = audit_chain_service.get_event(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail=f"Audit event '{event_id}' not found.")
    return ev

@router.post("/audit/reverify", response_model=ReverifyAuditResponse, summary="Re-verify mathematical integrity of cryptographic audit chain")
def reverify_audit_chain(user: dict = Depends(get_current_user)):
    verified, checked_cnt, first_invalid, reason = audit_chain_service.verify_chain()
    return {
        "verified": verified,
        "events_checked": checked_cnt,
        "first_invalid_event": first_invalid,
        "failure_reason": reason
    }
