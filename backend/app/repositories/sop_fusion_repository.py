from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List

import pandas as pd

from app.core import storage_paths


_COLUMNS = [
    "fusion_id", "case_id", "digital_score", "physical_score", "context_score",
    "cross_border_override", "raw_fusion_score", "calibrated_score", "tier_assigned",
    "calculated_at", "calculation_source",
]
_LOCK = Lock()


class SOPFusionRepository:
    def __init__(self, path: Path | None = None) -> None:
        self.path = path or storage_paths.DATA_DIR / "operations" / "sop_fusion_log.csv"

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
        return frame[_COLUMNS]

    def append(self, record: Dict[str, Any]) -> Dict[str, Any]:
        row = {column: record.get(column, "") for column in _COLUMNS}
        row["fusion_id"] = row["fusion_id"] or f"FUSION_{uuid.uuid4().hex[:12].upper()}"
        row["calculated_at"] = row["calculated_at"] or datetime.now(timezone.utc).isoformat()
        with _LOCK:
            frame = self._read()
            frame = pd.concat([frame, pd.DataFrame([row], columns=_COLUMNS)], ignore_index=True)
            self.path.parent.mkdir(parents=True, exist_ok=True)
            frame.to_csv(self.path, index=False)
        return row

    def latest_for_case(self, case_id: str) -> Dict[str, Any] | None:
        frame = self._read()
        if frame.empty:
            return None
        matches = frame[frame["case_id"].astype(str) == str(case_id)]
        return matches.tail(1).iloc[0].to_dict() if not matches.empty else None


sop_fusion_repository = SOPFusionRepository()
