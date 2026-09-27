from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List

import pandas as pd

from app.core import storage_paths

_COLUMNS = ["dispatch_id", "alert_id", "officer_id", "node_id", "target_lat", "target_lon", "deadline", "status", "gps_lat", "gps_lon", "status_timestamp", "outcome", "actual_cashout_confirmed", "notes", "prediction_correct", "actual_action_taken", "idempotency_key"]
_LOCK = Lock()


class DispatchEventRepository:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or storage_paths.DATA_DIR / "operations" / "dispatch_events.csv"

    def _read(self) -> pd.DataFrame:
        if not self.path.exists():
            return pd.DataFrame(columns=_COLUMNS)
        try:
            frame = pd.read_csv(self.path)
        except Exception:
            return pd.DataFrame(columns=_COLUMNS)
        for column in _COLUMNS:
            if column not in frame.columns:
                frame[column] = ""
        return frame[_COLUMNS].astype(object).where(pd.notna(frame[_COLUMNS]), None)

    def append(self, event: Dict[str, Any]) -> Dict[str, Any]:
        row = {column: event.get(column, "") for column in _COLUMNS}
        with _LOCK:
            frame = self._read()
            key = str(row.get("idempotency_key") or "").strip()
            if key and "idempotency_key" in frame.columns:
                existing = frame[frame["idempotency_key"].astype(str) == key]
                if not existing.empty:
                    return existing.tail(1).iloc[0].to_dict()
            frame = pd.concat([frame, pd.DataFrame([row], columns=_COLUMNS)], ignore_index=True)
            self.path.parent.mkdir(parents=True, exist_ok=True)
            frame.to_csv(self.path, index=False)
        return row

    def list_for_dispatch(self, dispatch_id: str) -> List[Dict[str, Any]]:
        frame = self._read()
        if frame.empty:
            return []
        return frame[frame["dispatch_id"].astype(str) == str(dispatch_id)].to_dict(orient="records")

    def latest_for_officer(self, officer_id: str) -> Dict[str, Any] | None:
        frame = self._read()
        if frame.empty:
            return None
        rows = frame[(frame["officer_id"].astype(str) == str(officer_id)) & frame["status"].isin(["DISPATCHED", "EN_ROUTE", "ON_SITE"])]
        return rows.tail(1).iloc[0].to_dict() if not rows.empty else None


dispatch_event_repository = DispatchEventRepository()
