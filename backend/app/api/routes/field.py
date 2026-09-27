from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.repositories.dispatch_event_repository import dispatch_event_repository
from app.repositories.node_repository import node_repository
from app.schemas.field import FieldOutcomeRequest, FieldStatusRequest
from app.services.audit.audit_chain_service import audit_chain_service
from app.services.operations.dispatch_service import dispatch_service
from app.core.sanitizer import sanitize_for_json
from app.utils.datetime_utils import now_iso

router = APIRouter()


@router.get("/field/active-dispatch")
def active_dispatch_for_current_officer(user: dict = Depends(get_current_user)):
    return _active_dispatch_for_officer(str(user.get("user_id", "OFFICER_001_DEFAULT")))

@router.get("/field/active-dispatch/{officer_id}")
def active_dispatch(officer_id: str, user: dict = Depends(get_current_user)):
    authenticated = str(user.get("user_id", ""))
    if authenticated and authenticated != officer_id:
        raise HTTPException(status_code=403, detail="Officer is not authorized for this assignment")
    return _active_dispatch_for_officer(officer_id)

def _active_dispatch_for_officer(officer_id: str):
    event = dispatch_event_repository.latest_for_officer(officer_id)
    if not event:
        return {"active": False, "dispatch": None}
    dispatch = dispatch_service.get_dispatch(str(event["dispatch_id"]))
    if not dispatch:
        return {"active": False, "dispatch": None, "latest_event": event}
    node = node_repository.get_node(str(dispatch.get("target_node_id", "")))
    events = dispatch_event_repository.list_for_dispatch(str(event["dispatch_id"]))
    return sanitize_for_json({"active": True, "dispatch": {**dispatch, "node": node}, "latest_event": event, "events": events})


@router.patch("/field/dispatch/{dispatch_id}/status")
def update_dispatch_status(dispatch_id: str, request: FieldStatusRequest, user: dict = Depends(get_current_user)):
    officer_id = str(user.get("user_id", "OFFICER_001_DEFAULT"))
    try:
        result = dispatch_service.update_field_status(dispatch_id, officer_id, request.status, request.gps_lat, request.gps_lon, request.notes, request.idempotency_key)
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if not result:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    audit_chain_service.append_event("FIELD_DISPATCH_STATUS_CHANGED", dispatch_id, {"dispatch_id": dispatch_id, "status": request.status, "gps_lat": request.gps_lat, "gps_lon": request.gps_lon, "notes": request.notes}, officer_id)
    return result


@router.post("/field/dispatch/{dispatch_id}/outcome")
def submit_dispatch_outcome(dispatch_id: str, request: FieldOutcomeRequest, user: dict = Depends(get_current_user)):
    officer_id = str(user.get("user_id", "OFFICER_001_DEFAULT"))
    dispatch = dispatch_service.get_dispatch(dispatch_id)
    if not dispatch:
        raise HTTPException(status_code=404, detail="Dispatch not found")
    try:
        dispatch = dispatch_service.assert_officer_assignment(dispatch_id, officer_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Dispatch not found") from exc
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    event = dispatch_event_repository.append({"dispatch_id": dispatch_id, "case_id": dispatch.get("case_id", ""), "node_id": dispatch.get("target_node_id", ""), "status": "ACTION_TAKEN", "outcome": request.outcome, "actual_cashout_confirmed": request.actual_cashout_confirmed, "notes": request.notes, "actual_action_taken": request.actual_action_taken, "prediction_correct": request.outcome == "intercepted" and request.actual_cashout_confirmed, "status_timestamp": now_iso(), "officer_id": officer_id})
    audit_chain_service.append_event("FIELD_DISPATCH_OUTCOME_REPORTED", dispatch_id, event, officer_id)
    return {"dispatch_id": dispatch_id, "accepted": True, "event": event}
