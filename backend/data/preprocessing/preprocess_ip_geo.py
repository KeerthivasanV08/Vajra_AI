"""
Preprocess Raw IP Geo Session Telemetry Dataset.
Output: data/processed/spatial/ip_geo_sessions_clean.csv
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

def preprocess_ip_geo() -> pd.DataFrame:
    raw_path = RAW_DIR / "spatial" / "ip_geo_sessions.csv"
    print(f"[PREPROCESS] Loading IP geo sessions from {raw_path}...")
    df = load_raw_csv(raw_path)
    df = clean_column_names(df)
    df = deduplicate_exact(df)
    
    df = parse_timestamps(df, ["session_timestamp"])
    
    df["geo_lat"] = df["geo_lat"].clip(-90.0, 90.0)
    df["geo_lon"] = df["geo_lon"].clip(-180.0, 180.0)
    df["distance_from_previous_km"] = df["distance_from_previous_km"].clip(lower=0.0)
    df["time_since_previous_session_sec"] = df["time_since_previous_session_sec"].clip(lower=0)
    
    # Sort by account and sequence number / timestamp
    df = df.sort_values(by=["account_id", "session_timestamp"]).reset_index(drop=True)
    
    out_path = PROCESSED_DIR / "spatial" / "ip_geo_sessions_clean.csv"
    return save_clean_csv(df, out_path, name="IP Geo Sessions Cleaned")

if __name__ == "__main__":
    preprocess_ip_geo()
