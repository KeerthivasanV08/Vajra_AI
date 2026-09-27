"""
Cryptographic Audit Chain Service Module for VAJRA Platform.
Implements append-only SHA-256 block-linked audit ledger (`SHA256(canonical_event + previous_hash)`).
"""

import logging
import uuid
from typing import Dict, Any, List, Optional, Tuple
from app.utils.hashing import hash_data
from app.utils.datetime_utils import now_iso
from app.repositories.audit_repository import audit_repository

logger = logging.getLogger(__name__)

GENESIS_PREVIOUS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

class AuditChainService:
    def __init__(self):
        self.repo = audit_repository
        self._ensure_genesis()

    def _ensure_genesis(self) -> None:
        events = self.repo.get_all_events()
        if not events:
            logger.warning(
                "AuditChainService: no existing chain found — creating genesis block. "
                "This is expected on first launch. If seen after prior operation, the "
                "CSV may be missing or corrupt."
            )
            genesis_payload = {"genesis": "VAJRA Cryptographic Audit Chain Initialized"}
            p_hash = hash_data(genesis_payload)
            g_event_id = "EVENT_GENESIS_00000"
            g_time = "2026-01-01T00:00:00Z"

            canonical_body = {
                "action_type": "GENESIS_BLOCK",
                "officer_id": "SYSTEM_GENESIS",
                "payload_hash": p_hash,
                "previous_hash": GENESIS_PREVIOUS_HASH,
                "target_entity": "SYSTEM",
                "timestamp": g_time
            }
            e_hash = hash_data(canonical_body)

            g_record = {
                "event_id": g_event_id,
                "timestamp": g_time,
                "officer_id": "SYSTEM_GENESIS",
                "action_type": "GENESIS_BLOCK",
                "target_entity": "SYSTEM",
                "payload_hash": p_hash,
                "previous_hash": GENESIS_PREVIOUS_HASH,
                "event_hash": e_hash
            }
            self.repo.append_event(g_record)

    def append_event(
        self,
        action_type: str,
        target_entity: str,
        payload: Dict[str, Any],
        officer_id: str = "OFFICER_001_DEFAULT"
    ) -> Dict[str, Any]:
        """Append a new tamper-evident event block to the audit chain."""
        events = self.repo.get_all_events()
        last_event = events[-1] if events else None
        prev_hash = last_event.get("event_hash", GENESIS_PREVIOUS_HASH) if last_event else GENESIS_PREVIOUS_HASH

        event_id = f"EVENT_{uuid.uuid4().hex[:10].upper()}"
        timestamp = now_iso()
        payload_hash = hash_data(payload)

        canonical_body = {
            "action_type": action_type,
            "officer_id": officer_id,
            "payload_hash": payload_hash,
            "previous_hash": prev_hash,
            "target_entity": target_entity,
            "timestamp": timestamp
        }

        event_hash = hash_data(canonical_body)

        record = {
            "event_id": event_id,
            "timestamp": timestamp,
            "officer_id": officer_id,
            "action_type": action_type,
            "target_entity": target_entity,
            "payload_hash": payload_hash,
            "previous_hash": prev_hash,
            "event_hash": event_hash
        }

        self.repo.append_event(record)
        return record

    def verify_chain(self) -> Tuple[bool, int, Optional[str], Optional[str]]:
        """
        Verify mathematical integrity of the cryptographic audit chain.
        Returns (verified_boolean, events_checked, first_invalid_event_id, failure_reason).
        """
        events = self.repo.get_all_events()
        if not events:
            return True, 0, None, None

        expected_prev = GENESIS_PREVIOUS_HASH

        for i, ev in enumerate(events):
            # Check link to previous hash — verified for ALL blocks including genesis (i=0).
            # Genesis block must carry GENESIS_PREVIOUS_HASH (64 zeros) as its previous_hash.
            actual_prev = str(ev.get("previous_hash", ""))
            if actual_prev != expected_prev:
                return False, i + 1, str(ev.get("event_id")), f"Previous hash mismatch at index {i}. Expected {expected_prev}, got {actual_prev}"

            # Recompute block event hash
            canonical_body = {
                "action_type": str(ev.get("action_type")),
                "officer_id": str(ev.get("officer_id")),
                "payload_hash": str(ev.get("payload_hash")),
                "previous_hash": str(ev.get("previous_hash")),
                "target_entity": str(ev.get("target_entity")),
                "timestamp": str(ev.get("timestamp"))
            }
            recomputed_hash = hash_data(canonical_body)
            if recomputed_hash != str(ev.get("event_hash")):
                return False, i + 1, str(ev.get("event_id")), f"Event hash tampering detected at event {ev.get('event_id')}."

            expected_prev = str(ev.get("event_hash"))

        return True, len(events), None, None

    def get_chain(self) -> List[Dict[str, Any]]:
        return self.repo.get_all_events()

    def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        return self.repo.get_event_by_id(event_id)

audit_chain_service = AuditChainService()
