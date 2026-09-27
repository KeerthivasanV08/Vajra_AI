"""
Preprocess Raw Devices Master Dataset.
Output: data/processed/onboarding/devices_clean.csv
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

def preprocess_devices() -> pd.DataFrame:
    raw_path = RAW_DIR / "trustvault" / "devices.csv"
    if not raw_path.exists():
        raw_path = RAW_DIR / "devices.csv"
        
    print(f"[PREPROCESS] Loading devices from {raw_path}...")
    df = load_raw_csv(raw_path)
    df = clean_column_names(df)
    df = deduplicate_exact(df)
    
    df = parse_timestamps(df, ["first_seen_at", "last_seen_at"])
    
    # Numeric & boolean cleanups
    df["shared_user_count"] = df["shared_user_count"].fillna(1).astype(int)
    df["device_age_days"] = df["device_age_days"].fillna(30).astype(int)
    df["root_status"] = df["root_status"].astype(int)
    df["emulator_flag"] = df["emulator_flag"].astype(int)
    df["app_cloner_flag"] = df["app_cloner_flag"].astype(int)
    df["shared_device_flag"] = df["shared_device_flag"].astype(int)
    
    out_path = PROCESSED_DIR / "onboarding" / "devices_clean.csv"
    return save_clean_csv(df, out_path, name="Devices Cleaned")

if __name__ == "__main__":
    preprocess_devices()
