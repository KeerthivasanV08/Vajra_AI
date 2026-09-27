"""
Preprocess Raw Onboarding Telemetry Dataset.
Output: data/processed/onboarding/onboarding_clean.csv
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

def preprocess_onboarding() -> pd.DataFrame:
    raw_path = RAW_DIR / "onboarding" / "onboarding_telemetry.csv"
    print(f"[PREPROCESS] Loading onboarding telemetry from {raw_path}...")
    df = load_raw_csv(raw_path)
    df = clean_column_names(df)
    df = deduplicate_exact(df)
    
    df = parse_timestamps(df, ["timestamp"])
    
    # Clip probability scores to [0, 1]
    score_cols = ["face_match_score", "identity_trust_score", "device_trust_score", "ip_risk_score", "copy_paste_ratio"]
    for col in score_cols:
        if col in df.columns:
            df[col] = df[col].clip(0.0, 1.0)
            
    # Non-negative numeric cleanups
    df["typing_speed"] = df["typing_speed"].clip(lower=0.0)
    df["form_completion_time"] = df["form_completion_time"].clip(lower=0)
    df["otp_retry_count"] = df["otp_retry_count"].clip(lower=0).astype(int)
    
    out_path = PROCESSED_DIR / "onboarding" / "onboarding_clean.csv"
    return save_clean_csv(df, out_path, name="Onboarding Telemetry Cleaned")

if __name__ == "__main__":
    preprocess_onboarding()
