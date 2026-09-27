"""
Preprocess Raw Transactions Dataset.
Output: data/processed/transactions/transactions_clean.csv
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import RAW_DIR, PROCESSED_DIR
from data.preprocessing.common_preprocessing import load_raw_csv, save_clean_csv, clean_column_names, parse_timestamps, deduplicate_exact

def preprocess_transactions() -> pd.DataFrame:
    raw_path = RAW_DIR / "transactions" / "transactions.csv"
    if not raw_path.exists():
        raw_path = RAW_DIR / "transactions.csv"
        
    print(f"[PREPROCESS] Loading transactions from {raw_path}...")
    df = load_raw_csv(raw_path)
    df = clean_column_names(df)
    df = deduplicate_exact(df)
    
    # Legacy field mapping if needed
    if "sender_id" in df.columns and "sender_account_id" not in df.columns:
        df["sender_account_id"] = "ACC" + df["sender_id"].astype(str).str.replace("^U", "", regex=True)
    if "receiver_id" in df.columns and "receiver_account_id" not in df.columns:
        df["receiver_account_id"] = "ACC" + df["receiver_id"].astype(str).str.replace("^U", "", regex=True)
    if "transaction_id" not in df.columns and "trans_id" in df.columns:
        df["transaction_id"] = "TXN" + df["trans_id"].astype(str).str.replace("^T", "", regex=True)
    if "is_cash_related" not in df.columns:
        df["is_cash_related"] = df["transaction_type"].astype(str).str.contains("CASH", case=False).astype(int)
    if "is_synthetic" not in df.columns:
        df["is_synthetic"] = 1

    df = parse_timestamps(df, ["timestamp"])
    
    # Filter negative amounts and sort by timestamp
    df["amount"] = df["amount"].clip(lower=0.0)
    df = df.sort_values(by="timestamp").reset_index(drop=True)
    
    # Latitude / longitude bounds
    if "sender_lat" in df.columns:
        df["sender_lat"] = df["sender_lat"].clip(-90.0, 90.0)
        df["sender_lon"] = df["sender_lon"].clip(-180.0, 180.0)
    if "receiver_lat" in df.columns:
        df["receiver_lat"] = df["receiver_lat"].clip(-90.0, 90.0)
        df["receiver_lon"] = df["receiver_lon"].clip(-180.0, 180.0)

    out_path = PROCESSED_DIR / "transactions" / "transactions_clean.csv"
    return save_clean_csv(df, out_path, name="Transactions Cleaned")

if __name__ == "__main__":
    preprocess_transactions()
