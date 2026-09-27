"""
Preprocess Raw Complaint Master Dataset.
Output: data/processed/complaints/complaints_clean.csv
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

def preprocess_complaints() -> pd.DataFrame:
    raw_path = RAW_DIR / "complaints" / "complaints.csv"
    print(f"[PREPROCESS] Loading complaints from {raw_path}...")
    df = load_raw_csv(raw_path)
    df = clean_column_names(df)
    df = deduplicate_exact(df)
    
    df = parse_timestamps(df, ["timestamp", "reported_at"])
    
    df["amount_reported"] = df["amount_reported"].clip(lower=0.0)
    df["victim_lat"] = df["victim_lat"].clip(-90.0, 90.0)
    df["victim_lon"] = df["victim_lon"].clip(-180.0, 180.0)
    df["fraud_category"] = df["fraud_category"].astype(str).str.upper()
    
    out_path = PROCESSED_DIR / "complaints" / "complaints_clean.csv"
    return save_clean_csv(df, out_path, name="Complaints Cleaned")

if __name__ == "__main__":
    preprocess_complaints()
