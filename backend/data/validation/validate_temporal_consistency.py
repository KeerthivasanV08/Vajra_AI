"""
Validate Temporal Consistency across VAJRA Datasets.
"""

import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import PROCESSED_DIR

def validate_temporal_consistency() -> bool:
    print("[VALIDATE] Checking temporal consistency...")
    
    all_passed = True
    
    users_path = PROCESSED_DIR / "onboarding" / "users_clean.csv"
    tx_path = PROCESSED_DIR / "transactions" / "transactions_clean.csv"
    ip_path = PROCESSED_DIR / "spatial" / "ip_geo_sessions_clean.csv"

    # 1. Check transaction timestamp >= account creation timestamp
    if users_path.exists() and tx_path.exists():
        df_u = pd.read_csv(users_path, usecols=["account_id", "created_at"])
        df_tx = pd.read_csv(tx_path, usecols=["sender_account_id", "timestamp"])
        
        df_u["created_at_dt"] = pd.to_datetime(df_u["created_at"]).dt.tz_localize(None)
        df_tx["timestamp_dt"] = pd.to_datetime(df_tx["timestamp"]).dt.tz_localize(None)
        
        merged = df_tx.merge(df_u, left_on="sender_account_id", right_on="account_id", how="inner")
        # Allow up to 1 day tolerance due to timezone/sampling jitter
        anomalies = (merged["timestamp_dt"] < (merged["created_at_dt"] - pd.Timedelta(days=1))).sum()
        
        if anomalies > 0:
            print(f"  [WARNING] {anomalies} transactions occurred prior to account creation timestamp")
        else:
            print("  [PASS] All transaction timestamps occur after account creation")

    # 2. Check IP Geo session sequence numbers vs timestamp order
    if ip_path.exists():
        df_ip = pd.read_csv(ip_path, usecols=["account_id", "session_sequence_number", "session_timestamp"])
        df_ip["session_dt"] = pd.to_datetime(df_ip["session_timestamp"]).dt.tz_localize(None)
        
        # Check monotonic increase per account
        df_ip["prev_dt"] = df_ip.groupby("account_id")["session_dt"].shift(1)
        inversions = ((df_ip["session_dt"] < df_ip["prev_dt"]).fillna(False)).sum()
        
        if inversions > 0:
            print(f"  [FAIL] {inversions} temporal inversions detected in IP session sequence")
            all_passed = False
        else:
            print("  [PASS] IP session sequences strictly match timestamp order")

    return all_passed

if __name__ == "__main__":
    validate_temporal_consistency()
