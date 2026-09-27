"""
Preprocess Raw Users / Account Master Dataset.
Output: data/processed/onboarding/users_clean.csv
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

def preprocess_users() -> pd.DataFrame:
    raw_path = RAW_DIR / "trustvault" / "users.csv"
    if not raw_path.exists():
        raw_path = RAW_DIR / "users.csv"
        
    print(f"[PREPROCESS] Loading users from {raw_path}...")
    df = load_raw_csv(raw_path)
    df = clean_column_names(df)
    df = deduplicate_exact(df)
    
    # Standardize column mapping if raw users has kyc_city
    if "kyc_city" in df.columns and "city" not in df.columns:
        df["city"] = df["kyc_city"]
    if "user_id" in df.columns and "account_id" not in df.columns:
        df["account_id"] = "ACC" + df["user_id"].astype(str).str.replace("^U", "", regex=True)
    if "synthetic_profile_type" not in df.columns:
        df["synthetic_profile_type"] = "NORMAL"
    if "domestic_session_ratio" not in df.columns:
        df["domestic_session_ratio"] = 0.95
    if "is_whitelisted" not in df.columns:
        df["is_whitelisted"] = 0

    df = parse_timestamps(df, ["created_at", "kyc_verified_at"])
    
    # Fill missing values deterministically
    df["account_status"] = df["account_status"].fillna("ACTIVE").astype(str).str.upper()
    df["kyc_status"] = df["kyc_status"].fillna("PENDING").astype(str).str.upper()
    df["account_age_days"] = df["account_age_days"].fillna(30).astype(int)
    df["domestic_session_ratio"] = df["domestic_session_ratio"].clip(0.0, 1.0)
    
    out_path = PROCESSED_DIR / "onboarding" / "users_clean.csv"
    return save_clean_csv(df, out_path, name="Users Cleaned")

if __name__ == "__main__":
    preprocess_users()
