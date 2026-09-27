"""
Build User Velocity Features Dataset.
Output: data/processed/transactions/user_velocity.csv
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

def build_velocity_features() -> pd.DataFrame:
    print("[FEATURES] Building velocity features...")
    users_path = PROCESSED_DIR / "onboarding" / "users_clean.csv"
    tx_path = PROCESSED_DIR / "transactions" / "transactions_clean.csv"

    df_u = pd.read_csv(users_path)
    df_tx = pd.read_csv(tx_path) if tx_path.exists() else pd.DataFrame()

    np_rng = np.random.RandomState(42)
    rows = []

    for idx, row in df_u.iterrows():
        u_id = row["user_id"]
        a_id = row["account_id"]

        # Synthetic/Engineered rolling descriptive velocity features per user
        tx_1h = int(np_rng.poisson(lam=0.5))
        tx_6h = int(tx_1h + np_rng.poisson(lam=1.5))
        tx_24h = int(tx_6h + np_rng.poisson(lam=3.0))

        sum_1h = round(float(tx_1h * np_rng.uniform(500, 10000)), 2)
        sum_6h = round(float(sum_1h + tx_6h * np_rng.uniform(1000, 15000)), 2)
        sum_24h = round(float(sum_6h + tx_24h * np_rng.uniform(2000, 30000)), 2)

        unique_24h = int(np_rng.randint(1, max(2, tx_24h + 1)))
        drain_ratio_ref = round(float(np_rng.beta(2, 5)), 4)
        avg_7d = round(float(np_rng.uniform(1000, 25000)), 2)
        near_thresh = int(np_rng.randint(0, 4))
        round_ratio = round(float(np_rng.uniform(0.1, 0.9)), 4)
        frag_score_ref = round(float(np_rng.beta(2, 6)), 4)
        holding_time = round(float(np_rng.exponential(scale=60.0) + 1.0), 2)
        vel_grad = round(float(sum_1h / max(1.0, sum_24h)), 4)

        rows.append({
            "user_id": u_id,
            "account_id": a_id,
            "rolling_1h_sum": sum_1h,
            "rolling_6h_sum": sum_6h,
            "rolling_24h_sum": sum_24h,
            "txn_count_1h": tx_1h,
            "txn_count_6h": tx_6h,
            "txn_count_24h": tx_24h,
            "unique_counterparties_24h": unique_24h,
            "drain_ratio_reference": drain_ratio_ref,
            "avg_tx_amount_7d": avg_7d,
            "near_threshold_count": near_thresh,
            "round_number_ratio": round_ratio,
            "fragmentation_score_reference": frag_score_ref,
            "avg_holding_time_mins": holding_time,
            "velocity_gradient": vel_grad
        })

    df_feat = pd.DataFrame(rows)
    out_path = PROCESSED_DIR / "transactions" / "user_velocity.csv"
    return save_clean_csv(df_feat, out_path, name="User Velocity Features")

if __name__ == "__main__":
    build_velocity_features()
