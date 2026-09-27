"""
Fairness & Bias Governance Audit Service Module for VAJRA Platform.
Executes Model 7 (Independent Governance Disparate Impact Auditor).
NON-SCORING LAYER — DOES NOT MUTATE DECISIONS OR SCORES.
"""

import json
import re
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.core.config import settings

class FairnessAuditService:
    def __init__(self):
        self.audit_json_path = settings.EVALUATION_ROOT / "fairness_audit.json"
        self.snapshot_path = settings.EVALUATION_ROOT / "fairness_region_stats.json"

    @staticmethod
    def _region_id(name: str) -> str:
        return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

    @staticmethod
    def _governance_flag(dir_value: Optional[float], predictions: int) -> str:
        if predictions < 10 or dir_value is None:
            return "N/A"
        if 0.80 <= dir_value <= 1.25:
            return "OK"
        if 0.60 <= dir_value < 0.80 or 1.25 < dir_value <= 1.50:
            return "REVIEW"
        return "FLAGGED"

    def _read_source(self) -> List[Dict[str, Any]]:
        if not self.audit_json_path.exists():
            return []
        with open(self.audit_json_path, "r", encoding="utf-8") as handle:
            return json.load(handle)

    def _calculate_rows(self) -> List[Dict[str, Any]]:
        rows = []
        calculated_at = datetime.now(timezone.utc).isoformat()
        for index, source in enumerate(self._read_source(), start=1):
            region_name = str(source.get("group") or f"Region {index}").strip()
            predictions = int(source.get("prediction_count") or 0)
            true_cases = int(source.get("confirmed_case_count") or 0)
            predicted_rate = source.get("predicted_high_risk_rate")
            confirmed_rate = source.get("confirmed_fraud_rate")
            predicted_pct = round(float(predicted_rate) * 100, 1) if predictions > 0 and predicted_rate is not None else None
            confirmed_pct = round(float(confirmed_rate) * 100, 1) if true_cases > 0 and confirmed_rate is not None else None
            dir_value = float(source["disparate_impact_ratio"]) if predictions >= 10 and source.get("disparate_impact_ratio") is not None else None
            rows.append({
                "region_id": self._region_id(region_name),
                "region_name": region_name,
                "state": region_name,
                "number_of_predictions": predictions,
                "number_of_true_cases": true_cases,
                "number_of_false_positives": int(source.get("false_positive_count") or 0),
                "number_of_false_negatives": int(source.get("false_negative_count") or 0),
                "predicted_high_risk_pct": predicted_pct,
                "confirmed_fraud_pct": confirmed_pct,
                "disparate_impact_ratio": round(dir_value, 4) if dir_value is not None else None,
                "governance_flag": self._governance_flag(dir_value, predictions),
                "calculated_at": calculated_at,
            })
        return rows

    def recalculate_regions(self) -> Dict[str, Any]:
        rows = self._calculate_rows()
        self.snapshot_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.snapshot_path, "w", encoding="utf-8") as handle:
            json.dump(rows, handle, indent=2, allow_nan=False)
        return self._response(rows)

    def _response(self, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "results": rows,
            "analyzed_groups_count": len(rows),
            "data_provenance": {
                "artifact": str(self.audit_json_path),
                "evaluation_type": "synthetic_holdout",
                "is_synthetic": True,
                "calculated_at": rows[0]["calculated_at"] if rows else None,
            },
            "disparate_impact_methodology": "Regional predicted high-risk rate divided by overall predicted high-risk baseline rate.",
            "governance_boundary": "NON_SCORING_DIAGNOSTIC",
        }

    def get_region_rows(self) -> List[Dict[str, Any]]:
        if self.snapshot_path.exists():
            try:
                with open(self.snapshot_path, "r", encoding="utf-8") as handle:
                    rows = json.load(handle)
                if isinstance(rows, list):
                    return rows
            except (OSError, json.JSONDecodeError):
                pass
        return self.recalculate_regions()["results"]

    def get_region_detail(self, region_id: str) -> Optional[Dict[str, Any]]:
        row = next((item for item in self.get_region_rows() if item["region_id"] == region_id), None)
        if row is None:
            return None
        return {**row, "dir_trend_30d": []}

    def get_fairness_summary(self) -> Dict[str, Any]:
        """Return the canonical regional snapshot for all fairness callers."""
        return self._response(self.get_region_rows())

fairness_audit_service = FairnessAuditService()
