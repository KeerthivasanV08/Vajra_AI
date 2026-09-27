"""
Node Repository Module for VAJRA Platform.
Manages withdrawal nodes master (`withdrawal_nodes_master.csv`) and node features (`node_features.csv`).
"""

from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
from app.core.config import settings
from app.repositories.csv_repository import CSVRepository

class NodeRepository:
    def __init__(self):
        self.master_repo = CSVRepository(
            settings.RAW_DATA_ROOT / "spatial" / "withdrawal_nodes_master.csv",
            primary_key="node_id"
        )
        self.feat_repo = CSVRepository(
            settings.PROCESSED_DATA_ROOT / "spatial" / "node_features.csv",
            primary_key="node_id"
        )

    def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        master_data = self.master_repo.find_by_id(node_id)
        if not master_data:
            return None
        feat_data = self.feat_repo.find_by_id(node_id) or {}
        merged = {**master_data, **feat_data}
        return merged

    def query_nodes(
        self,
        node_type: Optional[str] = None,
        bank: Optional[str] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        risk_min: Optional[float] = None,
        risk_max: Optional[float] = None,
        risk_band: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[Dict[str, Any]], int]:
        filters: Dict[str, Any] = {}
        if node_type:
            filters["node_type"] = node_type
        if bank:
            filters["bank_or_aggregator"] = bank
        if district:
            filters["district"] = district
        if state:
            filters["state"] = state
        if risk_min is not None or risk_max is not None:
            filters["vulnerability_score_reference"] = (risk_min, risk_max)

        # First query feature repo if risk filtering requested, otherwise master
        if risk_min is not None or risk_max is not None:
            feat_items, total = self.feat_repo.query(filters=filters, page=page, page_size=page_size)
            results = []
            for feat in feat_items:
                m = self.master_repo.find_by_id(feat.get("node_id")) or {}
                results.append({**m, **feat})
            return results, total
        else:
            if risk_band:
                filters["risk_band"] = risk_band.upper()
            if search:
                filters["node_id"] = search
            master_items, total = self.master_repo.query(filters=filters, page=page, page_size=page_size)
            results = []
            for m in master_items:
                f = self.feat_repo.find_by_id(m.get("node_id")) or {}
                results.append({**m, **f})
            return results, total

    def bulk_import(self, frame: pd.DataFrame) -> Dict[str, Any]:
        required = {"node_id", "node_type", "latitude", "longitude", "district", "state"}
        missing = sorted(required - set(frame.columns))
        if missing:
            raise ValueError(f"Missing required columns: {', '.join(missing)}")
        if frame["node_id"].duplicated().any():
            raise ValueError("Duplicate node_id values are not allowed")
        frame = frame.copy()
        frame["latitude"] = pd.to_numeric(frame["latitude"], errors="coerce")
        frame["longitude"] = pd.to_numeric(frame["longitude"], errors="coerce")
        if frame[["latitude", "longitude"]].isna().any().any() or (~frame["latitude"].between(-90, 90)).any() or (~frame["longitude"].between(-180, 180)).any():
            raise ValueError("Invalid latitude or longitude values")
        frame.to_csv(self.master_repo.file_path, index=False)
        self.master_repo.reload()
        return {"rows_processed": len(frame), "rows_accepted": len(frame), "rows_rejected": 0, "errors": []}

    def update_vulnerability(self, node_id: str, score: float) -> Dict[str, Any] | None:
        frame = self.feat_repo.get_all()
        if frame.empty or "node_id" not in frame.columns:
            return None
        if not (frame["node_id"].astype(str) == str(node_id)).any():
            return None
        frame.loc[frame["node_id"].astype(str) == str(node_id), "node_vulnerability_score"] = score
        frame.loc[frame["node_id"].astype(str) == str(node_id), "vulnerability_score_reference"] = score
        frame.to_csv(self.feat_repo.file_path, index=False)
        self.feat_repo.reload()
        return self.get_node(node_id)

    def get_all_nodes_df(self) -> pd.DataFrame:
        m_df = self.master_repo.get_all()
        f_df = self.feat_repo.get_all()
        if m_df.empty:
            return f_df
        if f_df.empty:
            return m_df
        if "node_id" in m_df.columns and "node_id" in f_df.columns:
            return m_df.merge(f_df, on="node_id", how="left", suffixes=("", "_feat"))
        return m_df

node_repository = NodeRepository()
