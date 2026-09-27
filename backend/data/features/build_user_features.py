"""
Build User Features Dataset.
Output: data/processed/onboarding/user_features.csv
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

def build_user_features() -> pd.DataFrame:
    print("[FEATURES] Building user features...")
    users_path = PROCESSED_DIR / "onboarding" / "users_clean.csv"
    tx_path = PROCESSED_DIR / "transactions" / "transactions_clean.csv"
    dev_path = PROCESSED_DIR / "onboarding" / "devices_clean.csv"
    onb_path = PROCESSED_DIR / "onboarding" / "onboarding_clean.csv"

    df_u = pd.read_csv(users_path)
    df_tx = pd.read_csv(tx_path) if tx_path.exists() else pd.DataFrame()
    df_dev = pd.read_csv(dev_path) if dev_path.exists() else pd.DataFrame()
    df_onb = pd.read_csv(onb_path) if onb_path.exists() else pd.DataFrame()

    # Aggregate transaction statistics per account
    if not df_tx.empty and "sender_account_id" in df_tx.columns:
        s_stats = df_tx.groupby("sender_account_id").agg(
            outbound_count=("transaction_id", "count"),
            outbound_amount=("amount", "sum"),
            unique_receivers=("receiver_account_id", "nunique"),
            avg_amount=("amount", "mean")
        ).reset_index()

        r_stats = df_tx.groupby("receiver_account_id").agg(
            inbound_count=("transaction_id", "count"),
            inbound_amount=("amount", "sum"),
            unique_senders=("sender_account_id", "nunique")
        ).reset_index()

        df_u = df_u.merge(s_stats, left_on="account_id", right_on="sender_account_id", how="left")
        df_u = df_u.merge(r_stats, left_on="account_id", right_on="receiver_account_id", how="left")
    else:
        df_u["outbound_count"] = 0
        df_u["outbound_amount"] = 0.0
        df_u["unique_receivers"] = 0
        df_u["avg_amount"] = 0.0
        df_u["inbound_count"] = 0
        df_u["inbound_amount"] = 0.0
        df_u["unique_senders"] = 0

    # Device & SIM info
    if not df_dev.empty and "device_id" in df_dev.columns:
        df_u = df_u.merge(df_dev[["device_id", "device_age_days", "shared_user_count"]], on="device_id", how="left", suffixes=("", "_dev"))
    else:
        df_u["device_age_days"] = df_u["account_age_days"]
        df_u["shared_user_count"] = 1

    if not df_onb.empty and "account_id" in df_onb.columns:
        df_u = df_u.merge(df_onb[["account_id", "sim_age_days"]], on="account_id", how="left", suffixes=("", "_onb"))
    else:
        df_u["sim_age_days"] = 180

    df_feat = pd.DataFrame({
        "account_id": df_u["account_id"],
        "user_id": df_u["user_id"],
        "account_age_days": df_u["account_age_days"].fillna(30).astype(int),
        "device_age_days": df_u["device_age_days"].fillna(30).astype(int),
        "domestic_session_ratio": df_u["domestic_session_ratio"].fillna(0.95),
        "transaction_count": (df_u["outbound_count"].fillna(0) + df_u["inbound_count"].fillna(0)).astype(int),
        "unique_counterparties": (df_u["unique_receivers"].fillna(0) + df_u["unique_senders"].fillna(0)).astype(int),
        "average_transaction_amount": df_u["avg_amount"].fillna(0.0).round(2),
        "total_transaction_amount": (df_u["outbound_amount"].fillna(0) + df_u["inbound_amount"].fillna(0)).round(2),
        "inbound_transaction_count": df_u["inbound_count"].fillna(0).astype(int),
        "outbound_transaction_count": df_u["outbound_count"].fillna(0).astype(int),
        "device_shared_count": df_u["shared_user_count"].fillna(1).astype(int),
        "sim_age_days": df_u["sim_age_days"].fillna(180).astype(int)
    })

    out_path = PROCESSED_DIR / "onboarding" / "user_features.csv"
    return save_clean_csv(df_feat, out_path, name="User Features")

if __name__ == "__main__":
    build_user_features()
