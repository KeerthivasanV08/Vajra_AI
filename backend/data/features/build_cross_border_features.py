"""
Build Cross-Border Features Dataset.
Output: data/processed/cross_border/cross_border_features.csv
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

def build_cross_border_features() -> pd.DataFrame:
    print("[FEATURES] Building cross border features...")
    cb_path = PROCESSED_DIR / "cross_border" / "cross_border_sessions_clean.csv"
    df = pd.read_csv(cb_path)

    df["session_timestamp_dt"] = pd.to_datetime(df["session_timestamp"])
    df["foreign_ip_first_seen_at_dt"] = pd.to_datetime(df["foreign_ip_first_seen_at"])
    
    df["hours_since_first_foreign_ip"] = ((df["session_timestamp_dt"] - df["foreign_ip_first_seen_at_dt"]).dt.total_seconds() / 3600.0).fillna(0.0).clip(lower=0.0).round(2)
    df["country_transition_count"] = (df["previous_country"] != df["current_country"]).astype(int)
    df["is_foreign_session"] = (df["current_country"] != "IN").astype(int)

    cols = [
        "cross_border_event_id", "account_id", "foreign_session_count_7d",
        "foreign_session_count_30d", "foreign_country_count", "vpn_usage_ratio_30d",
        "foreign_ip_ratio", "domestic_session_ratio_30d", "days_since_onboarding",
        "hours_since_first_foreign_ip", "country_transition_count",
        "current_country", "previous_country", "is_foreign_session"
    ]

    existing = [c for c in cols if c in df.columns]
    df_feat = df[existing].copy()

    out_path = PROCESSED_DIR / "cross_border" / "cross_border_features.csv"
    return save_clean_csv(df_feat, out_path, name="Cross Border Features")

if __name__ == "__main__":
    build_cross_border_features()
