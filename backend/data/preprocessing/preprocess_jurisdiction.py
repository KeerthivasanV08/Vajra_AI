"""
Preprocess Raw Jurisdiction Units and Geofence Assignments Datasets.
Output:
- data/processed/jurisdiction/jurisdiction_clean.csv
- data/processed/jurisdiction/geofence_assignments_clean.csv
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

def preprocess_jurisdiction() -> tuple:
    # 1. Units
    raw_units = RAW_DIR / "jurisdiction" / "jurisdiction_units.csv"
    print(f"[PREPROCESS] Loading jurisdiction units from {raw_units}...")
    df_u = load_raw_csv(raw_units)
    df_u = clean_column_names(df_u)
    df_u = deduplicate_exact(df_u)
    
    df_u["latitude"] = df_u["latitude"].clip(-90.0, 90.0)
    df_u["longitude"] = df_u["longitude"].clip(-180.0, 180.0)
    
    out_units = PROCESSED_DIR / "jurisdiction" / "jurisdiction_clean.csv"
    save_clean_csv(df_u, out_units, name="Jurisdiction Units Cleaned")

    # 2. Geofences
    raw_gf = RAW_DIR / "jurisdiction" / "geofence_assignments.csv"
    print(f"[PREPROCESS] Loading geofence assignments from {raw_gf}...")
    df_g = load_raw_csv(raw_gf)
    df_g = clean_column_names(df_g)
    df_g = deduplicate_exact(df_g)
    
    df_g = parse_timestamps(df_g, ["assignment_timestamp"])
    df_g["latitude"] = df_g["latitude"].clip(-90.0, 90.0)
    df_g["longitude"] = df_g["longitude"].clip(-180.0, 180.0)
    df_g["radius_km"] = df_g["radius_km"].clip(lower=0.1)
    
    out_gf = PROCESSED_DIR / "jurisdiction" / "geofence_assignments_clean.csv"
    save_clean_csv(df_g, out_gf, name="Geofence Assignments Cleaned")
    
    return df_u, df_g

if __name__ == "__main__":
    preprocess_jurisdiction()
