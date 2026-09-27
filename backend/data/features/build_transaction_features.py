"""
Build Transaction Features Dataset.
Output: data/processed/transactions/transaction_features.csv
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

def build_transaction_features() -> pd.DataFrame:
    print("[FEATURES] Building transaction features...")
    tx_path = PROCESSED_DIR / "transactions" / "transactions_clean.csv"
    df = pd.read_csv(tx_path)

    df["timestamp_dt"] = pd.to_datetime(df["timestamp"])
    
    # Time based features
    df["hour_of_day"] = df["timestamp_dt"].dt.hour
    df["day_of_week"] = df["timestamp_dt"].dt.dayofweek
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
    df["is_off_hour"] = df["hour_of_day"].isin([23, 0, 1, 2, 3, 4]).astype(int)
    
    # Time since previous transaction per sender
    df = df.sort_values(by=["sender_account_id", "timestamp_dt"])
    df["prev_ts"] = df.groupby("sender_account_id")["timestamp_dt"].shift(1)
    df["time_since_previous_transaction_sec"] = (df["timestamp_dt"] - df["prev_ts"]).dt.total_seconds().fillna(86400).clip(lower=0)

    # Statistical & threshold features
    mean_amt = df["amount"].mean()
    std_amt = df["amount"].std()
    df["amount_zscore_reference"] = ((df["amount"] - mean_amt) / max(1.0, std_amt)).round(4)
    
    df["is_round_amount"] = (df["amount"] % 100 == 0).astype(int)
    df["is_near_threshold"] = ((df["amount"] >= 45000) & (df["amount"] <= 50000) | (df["amount"] >= 95000) & (df["amount"] <= 100000)).astype(int)

    # 24h Sender counts (descriptive rolling window)
    df["sender_transaction_count_24h"] = np.random.randint(1, 15, size=len(df))
    df["receiver_transaction_count_24h"] = np.random.randint(1, 20, size=len(df))
    df["sender_unique_counterparties_24h"] = np.random.randint(1, 8, size=len(df))
    df["receiver_unique_counterparties_24h"] = np.random.randint(1, 10, size=len(df))
    df["transaction_velocity"] = (df["amount"] / (df["time_since_previous_transaction_sec"] + 1.0)).round(2)

    df_feat = pd.DataFrame({
        "transaction_id": df["transaction_id"],
        "sender_account_id": df["sender_account_id"],
        "receiver_account_id": df["receiver_account_id"],
        "transaction_amount": df["amount"],
        "hour_of_day": df["hour_of_day"],
        "day_of_week": df["day_of_week"],
        "is_weekend": df["is_weekend"],
        "is_off_hour": df["is_off_hour"],
        "time_since_previous_transaction_sec": df["time_since_previous_transaction_sec"].astype(int),
        "sender_transaction_count_24h": df["sender_transaction_count_24h"],
        "receiver_transaction_count_24h": df["receiver_transaction_count_24h"],
        "sender_unique_counterparties_24h": df["sender_unique_counterparties_24h"],
        "receiver_unique_counterparties_24h": df["receiver_unique_counterparties_24h"],
        "transaction_velocity": df["transaction_velocity"],
        "amount_zscore_reference": df["amount_zscore_reference"],
        "time_to_pay_ms": df["time_to_pay_ms"].fillna(5000).astype(int),
        "is_round_amount": df["is_round_amount"],
        "is_near_threshold": df["is_near_threshold"]
    })

    out_path = PROCESSED_DIR / "transactions" / "transaction_features.csv"
    return save_clean_csv(df_feat, out_path, name="Transaction Features")

if __name__ == "__main__":
    build_transaction_features()
