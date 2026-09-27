"""
Case Repository Module for VAJRA Platform.
Integrates with case store and complaints dataset.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
from app.core.config import settings
from app.repositories.csv_repository import CSVRepository

class CaseRepository:
    def __init__(self):
        self.complaints_repo = CSVRepository(
            settings.RAW_DATA_ROOT / "complaints" / "complaints.csv",
            primary_key="complaint_id"
        )
        self._memory_cases: Dict[str, Dict[str, Any]] = {}

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        if case_id in self._memory_cases:
            return self._memory_cases[case_id]
        comp = self.complaints_repo.find_by_id(case_id)
        if comp:
            return {
                "case_id": comp.get("complaint_id"),
                "account_id": comp.get("account_id"),
                "status": "OPEN",
                "severity": comp.get("complaint_severity", "MEDIUM"),
                "amount": comp.get("fraud_amount_inr", 0),
                "created_at": comp.get("complaint_timestamp")
            }
        return None

    def save_case(self, case_data: Dict[str, Any]) -> None:
        cid = str(case_data.get("case_id", ""))
        if cid:
            self._memory_cases[cid] = case_data

case_repository = CaseRepository()
