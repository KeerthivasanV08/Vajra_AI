"""
Dispatch Service Module for VAJRA Platform.
Manages PCR Patrol and Bank Step-Up dispatch requests with audit chain event creation.
PROTOTYPE SAFE MODE — EXECUTES VIA INTERNAL MOCK ADAPTER, DOES NOT CALL LIVE EMERGENCY INFRASTRUCTURE.
"""

import uuid
from datetime import timedelta
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.constants import (
    DISPATCH_ACTION_PCR_PATROL, DISPATCH_ACTION_BANK_STEP_UP,
    DISPATCH_STATUS_REQUESTED, DISPATCH_STATUS_SENT, DISPATCH_STATUS_ACKNOWLEDGED
)
from app.utils.datetime_utils import now_iso, now_utc
from app.repositories.dispatch_event_repository import dispatch_event_repository

class DispatchService:
    def __init__(self):
        self._dispatches: Dict[str, Dict[str, Any]] = {}
        self._restore_dispatches()

    def _restore_dispatches(self) -> None:
        frame = dispatch_event_repository._read()
        for row in frame.to_dict(orient="records"):
            dispatch_id = str(row.get("dispatch_id") or "").strip()
            if not dispatch_id:
                continue
            record = self._dispatches.setdefault(dispatch_id, {
                "dispatch_id": dispatch_id,
                "case_id": row.get("case_id", ""),
                "prediction_id": row.get("prediction_id", ""),
                "target_node_id": row.get("node_id", ""),
                "target_coordinates": {"latitude": row.get("target_lat"), "longitude": row.get("target_lon")},
                "requested_by": row.get("officer_id", "SYSTEM_AUTOMATED"),
                "timestamp": row.get("status_timestamp", now_iso()),
                "deadline": row.get("deadline") or None,
                "status": row.get("status", DISPATCH_STATUS_SENT),
                "field_status": row.get("status", DISPATCH_STATUS_SENT),
                "field_status_updated_at": row.get("status_timestamp", now_iso()),
                "mock_mode": True,
            })
            status = str(row.get("status") or "").strip()
            if status:
                record["field_status"] = status
                record["field_status_updated_at"] = row.get("status_timestamp", record["field_status_updated_at"])
                if status == "DISPATCHED":
                    record["status"] = DISPATCH_STATUS_SENT

    def create_pcr_dispatch(
        self,
        case_id: str,
        prediction_id: str,
        target_node_id: str,
        target_lat: float,
        target_lon: float,
        requested_by: str = "SYSTEM_AUTOMATED"
    ) -> Dict[str, Any]:
        """Create a Police Control Room (PCR) patrol dispatch recommendation event."""
        dispatch_id = f"DISPATCH_PCR_{uuid.uuid4().hex[:10].upper()}"

        record = {
            "dispatch_id": dispatch_id,
            "case_id": case_id,
            "prediction_id": prediction_id,
            "action_type": DISPATCH_ACTION_PCR_PATROL,
            "target_node_id": target_node_id,
            "target_coordinates": {"latitude": target_lat, "longitude": target_lon},
            "requested_by": requested_by,
            "timestamp": now_iso(),
            "deadline": (now_utc() + timedelta(minutes=settings.DISPATCH_SLA_MINUTES)).isoformat().replace("+00:00", "Z"),
            "status": DISPATCH_STATUS_SENT,
            "external_dispatch_enabled": settings.ENABLE_EXTERNAL_DISPATCH,
            "mock_mode": True
        }

        self._dispatches[dispatch_id] = record
        dispatch_event_repository.append({"dispatch_id": dispatch_id, "case_id": case_id, "node_id": target_node_id, "target_lat": target_lat, "target_lon": target_lon, "deadline": record["deadline"], "status": "DISPATCHED", "status_timestamp": record["timestamp"], "officer_id": requested_by})
        return record

    def create_bank_stepup(
        self,
        account_id: str,
        case_id: str,
        requested_by: str = "SYSTEM_AUTOMATED"
    ) -> Dict[str, Any]:
        """Create a Bank Step-Up authentication / hold recommendation event."""
        dispatch_id = f"DISPATCH_BANK_{uuid.uuid4().hex[:10].upper()}"

        record = {
            "dispatch_id": dispatch_id,
            "account_id": account_id,
            "case_id": case_id,
            "action_type": DISPATCH_ACTION_BANK_STEP_UP,
            "requested_by": requested_by,
            "timestamp": now_iso(),
            "status": DISPATCH_STATUS_SENT,
            "bank_actions_enabled": settings.ENABLE_BANK_ACTIONS,
            "mock_mode": True
        }

        self._dispatches[dispatch_id] = record
        return record

    def get_dispatch(self, dispatch_id: str) -> Optional[Dict[str, Any]]:
        return self._dispatches.get(dispatch_id)

    def update_field_status(self, dispatch_id: str, officer_id: str, status: str, gps_lat: float | None = None, gps_lon: float | None = None, notes: str = "", idempotency_key: str | None = None) -> Optional[Dict[str, Any]]:
        record = self._dispatches.get(dispatch_id)
        if not record:
            return None
        if str(record.get("requested_by", "")) != str(officer_id):
            raise PermissionError("Officer is not assigned to this dispatch")
        current = record.get("field_status", "DISPATCHED")
        allowed = {"DISPATCHED": {"EN_ROUTE"}, "EN_ROUTE": {"ON_SITE"}, "ON_SITE": {"ACTION_TAKEN"}, "ACTION_TAKEN": set()}
        if status not in allowed.get(current, set()):
            raise ValueError(f"Invalid field status transition: {current} -> {status}")
        timestamp = now_iso()
        record.update({"field_status": status, "field_status_updated_at": timestamp})
        dispatch_event_repository.append({"dispatch_id": dispatch_id, "case_id": record.get("case_id", ""), "node_id": record.get("target_node_id", ""), "target_lat": (record.get("target_coordinates") or {}).get("latitude"), "target_lon": (record.get("target_coordinates") or {}).get("longitude"), "deadline": record.get("deadline"), "status": status, "gps_lat": gps_lat, "gps_lon": gps_lon, "status_timestamp": timestamp, "officer_id": officer_id, "notes": notes, "idempotency_key": idempotency_key})
        return record

    def assert_officer_assignment(self, dispatch_id: str, officer_id: str) -> Dict[str, Any]:
        record = self._dispatches.get(dispatch_id)
        if not record:
            raise KeyError("Dispatch not found")
        if str(record.get("requested_by", "")) != str(officer_id):
            raise PermissionError("Officer is not assigned to this dispatch")
        return record

    def list_dispatches(self, page: int = 1, page_size: int = 50) -> List[Dict[str, Any]]:
        items = list(self._dispatches.values())
        items.reverse()
        start = (page - 1) * page_size
        return items[start:start + page_size]

    def acknowledge_dispatch(self, dispatch_id: str, officer_id: str) -> Optional[Dict[str, Any]]:
        rec = self._dispatches.get(dispatch_id)
        if rec:
            rec["status"] = DISPATCH_STATUS_ACKNOWLEDGED
            rec["acknowledged_by"] = officer_id
            rec["acknowledged_at"] = now_iso()
            return rec
        return None

dispatch_service = DispatchService()
