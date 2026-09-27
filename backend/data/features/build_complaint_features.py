"""
Build Complaint Features Dataset.
Output: data/processed/complaints/complaint_features.csv
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

def build_complaint_features() -> pd.DataFrame:
    print("[FEATURES] Building complaint features...")
    cmp_path = PROCESSED_DIR / "complaints" / "complaints_clean.csv"
    df = pd.read_csv(cmp_path)

    df["timestamp_dt"] = pd.to_datetime(df["timestamp"])

    grouped = df.groupby("victim_account_id")

    rows = []
    for acc_id, group in grouped:
        c_count = len(group)
        tot_amt = round(float(group["amount_reported"].sum()), 2)
        avg_amt = round(float(group["amount_reported"].mean()), 2)
        
        first_dt = group["timestamp_dt"].min()
        last_dt = group["timestamp_dt"].max()
        days_since_first = int((last_dt - first_dt).total_seconds() / 86400.0)
        
        linked_tx_cnt = int(group["linked_transaction_count"].sum())
        linked_node_cnt = int(group["linked_node_id"].nunique())
        
        # 30 day frequency
        max_dt = df["timestamp_dt"].max()
        recent_count = int((group["timestamp_dt"] >= (max_dt - pd.Timedelta(days=30))).sum())
        cat_count = int(group["fraud_category"].nunique())

        rows.append({
            "account_id": acc_id,
            "complaint_count_by_account": c_count,
            "total_reported_amount": tot_amt,
            "average_reported_amount": avg_amt,
            "days_since_first_complaint": days_since_first,
            "linked_transaction_count": linked_tx_cnt,
            "linked_node_count": linked_node_cnt,
            "complaint_frequency_30d": recent_count,
            "fraud_category_count": cat_count
        })

    df_feat = pd.DataFrame(rows)
    out_path = PROCESSED_DIR / "complaints" / "complaint_features.csv"
    return save_clean_csv(df_feat, out_path, name="Complaint Features")

if __name__ == "__main__":
    build_complaint_features()
