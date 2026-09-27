"""
Preprocess Raw Cross-Border Session Dataset.
Output: data/processed/cross_border/cross_border_sessions_clean.csv
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

def preprocess_cross_border() -> pd.DataFrame:
    raw_path = RAW_DIR / "cross_border" / "cross_border_sessions.csv"
    print(f"[PREPROCESS] Loading cross border sessions from {raw_path}...")
    df = load_raw_csv(raw_path)
    df = clean_column_names(df)
    df = deduplicate_exact(df)
    
    df = parse_timestamps(df, ["session_timestamp", "foreign_ip_first_seen_at"])
    
    ratios = ["domestic_session_ratio_30d", "vpn_usage_ratio_30d", "foreign_ip_ratio"]
    for r in ratios:
        if r in df.columns:
            df[r] = df[r].clip(0.0, 1.0)
            
    counts = ["foreign_session_count_7d", "foreign_session_count_30d", "foreign_country_count", "days_since_onboarding"]
    for c in counts:
        if c in df.columns:
            df[c] = df[c].clip(lower=0).astype(int)
            
    out_path = PROCESSED_DIR / "cross_border" / "cross_border_sessions_clean.csv"
    return save_clean_csv(df, out_path, name="Cross Border Sessions Cleaned")

if __name__ == "__main__":
    preprocess_cross_border()
