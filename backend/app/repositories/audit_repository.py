"""
Audit Repository Module for VAJRA Platform.
Manages persistent and in-memory cryptographic audit log chain events (`audit_logs.csv`).
Events are written to disk immediately on every append so the chain survives restarts.
"""

import logging
from typing import Dict, Any, List, Optional
import pandas as pd
from app.core.config import settings

logger = logging.getLogger(__name__)

# Canonical column order mirrors the block schema — must remain stable.
_CSV_COLUMNS = [
    "event_id",
    "timestamp",
    "officer_id",
    "action_type",
    "target_entity",
    "payload_hash",
    "previous_hash",
    "event_hash",
]

class AuditRepository:
    def __init__(self):
        self._events: List[Dict[str, Any]] = []
        self._file_path = settings.RAW_DATA_ROOT / "operations" / "audit_logs.csv"
        self._load_existing()

    def _load_existing(self) -> None:
        """Load existing audit chain from CSV on startup."""
        if self._file_path.exists():
            try:
                df = pd.read_csv(self._file_path, dtype=str)
                for _, row in df.iterrows():
                    self._events.append(row.to_dict())
                logger.info(
                    "AuditRepository: loaded %d existing audit events from %s",
                    len(self._events),
                    self._file_path,
                )
            except Exception as exc:
                logger.error(
                    "AuditRepository: failed to load audit_logs.csv — chain starts empty. Error: %s",
                    exc,
                )

    def _persist_event(self, event: Dict[str, Any]) -> None:
        """Append a single event row to the CSV immediately after in-memory append."""
        try:
            self._file_path.parent.mkdir(parents=True, exist_ok=True)
            row_df = pd.DataFrame([event], columns=_CSV_COLUMNS)
            write_header = not self._file_path.exists()
            row_df.to_csv(
                self._file_path,
                mode="a",
                header=write_header,
                index=False,
            )
        except Exception as exc:
            logger.error(
                "AuditRepository: failed to persist audit event '%s' to CSV. Error: %s",
                event.get("event_id"),
                exc,
            )

    def append_event(self, event: Dict[str, Any]) -> None:
        """Append event to in-memory chain and immediately persist it to CSV."""
        self._events.append(event)
        self._persist_event(event)

    def get_all_events(self) -> List[Dict[str, Any]]:
        return list(self._events)

    def get_event_by_id(self, event_id: str) -> Optional[Dict[str, Any]]:
        for ev in self._events:
            if str(ev.get("event_id")) == str(event_id):
                return ev
        return None

audit_repository = AuditRepository()
