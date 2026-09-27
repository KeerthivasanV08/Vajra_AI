"""
Preprocess Raw Prediction Outcomes Dataset.
Output: data/processed/operations/prediction_outcomes_clean.csv
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

def preprocess_prediction_outcomes() -> pd.DataFrame:
    raw_path = RAW_DIR / "operations" / "prediction_outcomes.csv"
    print(f"[PREPROCESS] Loading prediction outcomes from {raw_path}...")
    df = load_raw_csv(raw_path)
    df = clean_column_names(df)
    df = deduplicate_exact(df)
    
    df = parse_timestamps(df, ["scenario_timestamp", "actual_withdrawal_timestamp"])
    
    coords = ["predicted_lat_reference", "actual_withdrawal_lat"]
    for c in coords:
        if c in df.columns:
            df[c] = df[c].clip(-90.0, 90.0)
            
    coords_lon = ["predicted_lon_reference", "actual_withdrawal_lon"]
    for c in coords_lon:
        if c in df.columns:
            df[c] = df[c].clip(-180.0, 180.0)
            
    df["candidate_reference_probability"] = df["candidate_reference_probability"].clip(0.0, 1.0)
    df["time_to_cashout_mins"] = df["time_to_cashout_mins"].clip(lower=0)
    df["time_to_intervention_mins"] = df["time_to_intervention_mins"].clip(lower=0)
    
    out_path = PROCESSED_DIR / "operations" / "prediction_outcomes_clean.csv"
    return save_clean_csv(df, out_path, name="Prediction Outcomes Cleaned")

if __name__ == "__main__":
    preprocess_prediction_outcomes()
