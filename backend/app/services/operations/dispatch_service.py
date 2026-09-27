"""
Dispatch Service Module for VAJRA Platform.
Manages PCR Patrol and Bank Step-Up dispatch requests with audit chain event creation.
PROTOTYPE SAFE MODE — EXECUTES VIA INTERNAL MOCK ADAPTER, DOES NOT CALL LIVE EMERGENCY INFRASTRUCTURE.
"""

import uuid
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.constants import (
    DISPATCH_ACTION_PCR_PATROL, DISPATCH_ACTION_BANK_STEP_UP,
    DISPATCH_STATUS_REQUESTED, DISPATCH_STATUS_SENT, DISPATCH_STATUS_ACKNOWLEDGED
)
from app.utils.datetime_utils import now_iso

class DispatchService:
    def __init__(self):
        self._dispatches: Dict[str, Dict[str, Any]] = {}

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
            "status": DISPATCH_STATUS_SENT,
            "external_dispatch_enabled": settings.ENABLE_EXTERNAL_DISPATCH,
            "mock_mode": True
        }

        self._dispatches[dispatch_id] = record
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
