"""
Prediction Repository Module for VAJRA Platform.
Manages storage and in-memory caching of physical prediction outcomes and candidates.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
from app.core.config import settings

class PredictionRepository:
    def __init__(self):
        self._predictions_store: Dict[str, Dict[str, Any]] = {}
        self._file_path = settings.RAW_DATA_ROOT / "operations" / "prediction_outcomes.csv"
        self._load_existing()

    def _load_existing(self) -> None:
        if self._file_path.exists():
            try:
                df = pd.read_csv(self._file_path)
                for _, row in df.iterrows():
                    rec = row.to_dict()
                    pid = str(rec.get("prediction_id", ""))
                    if pid:
                        self._predictions_store[pid] = rec
            except Exception:
                pass

    def save_prediction(self, prediction_data: Dict[str, Any]) -> None:
        pid = str(prediction_data.get("prediction_id", ""))
        if pid:
            self._predictions_store[pid] = prediction_data

    def get_prediction(self, prediction_id: str) -> Optional[Dict[str, Any]]:
        return self._predictions_store.get(prediction_id)

    def get_history(self, page: int = 1, page_size: int = 50) -> List[Dict[str, Any]]:
        items = list(self._predictions_store.values())
        items.reverse()
        start = (page - 1) * page_size
        return items[start:start + page_size]

prediction_repository = PredictionRepository()
