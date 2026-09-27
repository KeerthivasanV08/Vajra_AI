"""
Build Withdrawal Node Features Dataset.
Output: data/processed/spatial/node_features.csv
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import PROCESSED_DIR
from data.preprocessing.common_preprocessing import save_clean_csv

def build_node_features() -> pd.DataFrame:
    print("[FEATURES] Building node features...")
    node_path = PROCESSED_DIR / "spatial" / "withdrawal_nodes_clean.csv"
    df = pd.read_csv(node_path)

    df["historical_cashout_ratio"] = (df["historical_cash_withdrawals"] / df["historical_txn_volume"].clip(lower=1)).round(4)
    df["historical_fraud_ratio"] = (df["historical_fraud_cashouts"] / df["historical_cash_withdrawals"].clip(lower=1)).round(4)
    df["activity_density_reference"] = (df["average_daily_transactions"] / (df["distance_to_known_corridor_km"].clip(lower=0.5))).round(4)

    cols = [
        "node_id", "node_type", "historical_txn_volume", "average_daily_transactions",
        "average_transaction_amount", "off_hour_withdrawal_ratio", "historical_cash_withdrawals",
        "historical_fraud_cashouts", "previous_fraud_flags", "distance_to_known_corridor_km",
        "cash_limit_daily", "weekend_active", "historical_cashout_ratio",
        "historical_fraud_ratio", "activity_density_reference", "vulnerability_score_reference"
    ]

    existing = [c for c in cols if c in df.columns]
    df_feat = df[existing].copy()

    out_path = PROCESSED_DIR / "spatial" / "node_features.csv"
    return save_clean_csv(df_feat, out_path, name="Withdrawal Node Features")

if __name__ == "__main__":
    build_node_features()
