"""
Build Cash-Out Operations Features Dataset.
Output: data/processed/operations/cashout_features.csv
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import PROCESSED_DIR
from data.preprocessing.common_preprocessing import save_clean_csv

def build_cashout_features() -> pd.DataFrame:
    print("[FEATURES] Building cash-out features...")
    tx_path = PROCESSED_DIR / "transactions" / "transactions_clean.csv"
    nodes_path = PROCESSED_DIR / "spatial" / "withdrawal_nodes_clean.csv"
    pred_path = PROCESSED_DIR / "operations" / "prediction_outcomes_clean.csv"

    df_tx = pd.read_csv(tx_path)
    df_nodes = pd.read_csv(nodes_path) if nodes_path.exists() else pd.DataFrame()
    df_pred = pd.read_csv(pred_path) if pred_path.exists() else pd.DataFrame()

    # Filter cash related or outbound transfers
    cash_tx = df_tx[df_tx["is_cash_related"] == 1].copy()
    if cash_tx.empty:
        cash_tx = df_tx.head(10000).copy()

    np_rng = np.random.RandomState(42)
    node_ids = df_nodes["node_id"].values if not df_nodes.empty else [f"NODE{i:06d}" for i in range(1000)]
    node_dict = df_nodes.set_index("node_id").to_dict("index") if not df_nodes.empty else {}

    rows = []
    for idx, row in cash_tx.iterrows():
        a_id = row["sender_account_id"]
        n_id = np_rng.choice(node_ids)
        
        n_info = node_dict.get(n_id, {})
        n_type = n_info.get("node_type", "ATM")
        dist_node = round(float(np_rng.uniform(0.2, 15.0)), 2)
        dist_corr = n_info.get("distance_to_known_corridor_km", round(float(np_rng.uniform(1.0, 45.0)), 2))
        
        w_amt = float(row["amount"])
        off_hour = int(row.get("is_off_hour", np_rng.choice([0, 1], p=[0.8, 0.2])))
        
        n_vol = n_info.get("historical_txn_volume", int(np_rng.randint(1000, 50000)))
        n_fraud = n_info.get("historical_fraud_cashouts", int(np_rng.randint(0, 10)))
        
        time_since_tx = round(float(np_rng.exponential(scale=30.0) + 2.0), 2)
        
        ts_dt = pd.to_datetime(row["timestamp"])
        w_start = (ts_dt + timedelta(minutes=int(time_since_tx))).strftime("%Y-%m-%d %H:%M:%S")
        w_end = (ts_dt + timedelta(minutes=int(time_since_tx + 60))).strftime("%Y-%m-%d %H:%M:%S")

        rows.append({
            "account_id": a_id,
            "node_id": n_id,
            "node_type": n_type,
            "distance_to_node_km": dist_node,
            "distance_to_corridor_km": dist_corr,
            "off_hour_flag": off_hour,
            "withdrawal_amount": w_amt,
            "node_historical_volume": n_vol,
            "node_historical_fraud_cashouts": n_fraud,
            "time_since_last_transfer_mins": time_since_tx,
            "candidate_window_start_reference": w_start,
            "candidate_window_end_reference": w_end
        })

    df_feat = pd.DataFrame(rows)
    out_path = PROCESSED_DIR / "operations" / "cashout_features.csv"
    return save_clean_csv(df_feat, out_path, name="Cash-Out Features")

if __name__ == "__main__":
    build_cashout_features()
