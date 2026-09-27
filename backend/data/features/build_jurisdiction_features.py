"""
Build Jurisdiction Features Dataset.
Output: data/processed/jurisdiction/jurisdiction_features.csv
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

def build_jurisdiction_features() -> pd.DataFrame:
    print("[FEATURES] Building jurisdiction features...")
    gf_path = PROCESSED_DIR / "jurisdiction" / "geofence_assignments_clean.csv"
    lea_path = PROCESSED_DIR / "jurisdiction" / "jurisdiction_clean.csv"

    df_gf = pd.read_csv(gf_path)
    df_lea = pd.read_csv(lea_path) if lea_path.exists() else pd.DataFrame()

    if not df_lea.empty and "nearest_lea_unit_id" in df_lea.columns:
        df = df_gf.merge(df_lea[["nearest_lea_unit_id", "beat_code", "contact_channel", "is_active"]], on="nearest_lea_unit_id", how="left")
    else:
        df = df_gf.copy()
        df["beat_code"] = "BEAT_DEF_01"
        df["contact_channel"] = "PHONE"
        df["is_active"] = 1

    df["distance_to_lea_unit_km"] = df["radius_km"].clip(lower=0.1)
    df.rename(columns={"is_active": "active_unit_flag"}, inplace=True)

    cols = [
        "geofence_id", "nearest_lea_unit_id", "distance_to_lea_unit_km",
        "beat_code", "district", "state", "contact_channel", "active_unit_flag"
    ]

    existing = [c for c in cols if c in df.columns]
    df_feat = df[existing].copy()

    out_path = PROCESSED_DIR / "jurisdiction" / "jurisdiction_features.csv"
    return save_clean_csv(df_feat, out_path, name="Jurisdiction Features")

if __name__ == "__main__":
    build_jurisdiction_features()
