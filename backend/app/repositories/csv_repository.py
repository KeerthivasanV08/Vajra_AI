"""
Generic CSV Repository Module for VAJRA Platform.
Implements in-memory indexed pandas dataframe access for prototype CSV datasets with filtering, pagination, sorting, and ID lookups.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
from app.core.exceptions import DatasetNotAvailableError

class CSVRepository:
    def __init__(self, file_path: Path, primary_key: str):
        self.file_path = file_path
        self.primary_key = primary_key
        self._df: Optional[pd.DataFrame] = None
        self.reload()

    def reload(self) -> None:
        if self.file_path.exists():
            try:
                self._df = pd.read_csv(self.file_path)
            except Exception as e:
                self._df = pd.DataFrame()
        else:
            self._df = pd.DataFrame()

    def get_all(self) -> pd.DataFrame:
        if self._df is None:
            self.reload()
        return self._df.copy()

    def find_by_id(self, item_id: Any) -> Optional[Dict[str, Any]]:
        df = self.get_all()
        if df.empty or self.primary_key not in df.columns:
            return None
        matched = df[df[self.primary_key].astype(str) == str(item_id)]
        if not matched.empty:
            return matched.iloc[0].to_dict()
        return None

    def query(
        self,
        filters: Optional[Dict[str, Any]] = None,
        page: int = 1,
        page_size: int = 50,
        sort_by: Optional[str] = None,
        ascending: bool = True
    ) -> Tuple[List[Dict[str, Any]], int]:
        df = self.get_all()
        if df.empty:
            return [], 0

        filtered = df
        if filters:
            for col, val in filters.items():
                if col in filtered.columns and val is not None:
                    if isinstance(val, tuple) and len(val) == 2:
                        min_val, max_val = val
                        if min_val is not None:
                            filtered = filtered[filtered[col] >= min_val]
                        if max_val is not None:
                            filtered = filtered[filtered[col] <= max_val]
                    elif isinstance(val, str):
                        filtered = filtered[filtered[col].astype(str).str.contains(val, case=False, na=False)]
                    else:
                        filtered = filtered[filtered[col] == val]

        total_count = len(filtered)

        if sort_by and sort_by in filtered.columns:
            filtered = filtered.sort_values(by=sort_by, ascending=ascending)

        # Pagination
        page = max(1, page)
        page_size = min(max(1, page_size), 100)
        start = (page - 1) * page_size
        end = start + page_size

        sliced = filtered.iloc[start:end]
        items = sliced.to_dict(orient="records")
        return items, total_count
