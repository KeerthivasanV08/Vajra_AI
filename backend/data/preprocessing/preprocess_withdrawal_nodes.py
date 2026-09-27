"""
Preprocess Raw Withdrawal Node Master Dataset.
Output: data/processed/spatial/withdrawal_nodes_clean.csv
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

def preprocess_withdrawal_nodes() -> pd.DataFrame:
    raw_path = RAW_DIR / "spatial" / "withdrawal_nodes_master.csv"
    print(f"[PREPROCESS] Loading withdrawal nodes from {raw_path}...")
    df = load_raw_csv(raw_path)
    df = clean_column_names(df)
    df = deduplicate_exact(df)
    
    # Coordinate clipping & node type uppercase
    df["latitude"] = df["latitude"].clip(-90.0, 90.0)
    df["longitude"] = df["longitude"].clip(-180.0, 180.0)
    df["node_type"] = df["node_type"].astype(str).str.upper()
    df["vulnerability_score_reference"] = df["vulnerability_score_reference"].clip(0.0, 1.0)
    
    df = parse_timestamps(df, ["last_updated"])
    
    out_path = PROCESSED_DIR / "spatial" / "withdrawal_nodes_clean.csv"
    return save_clean_csv(df, out_path, name="Withdrawal Nodes Cleaned")

if __name__ == "__main__":
    preprocess_withdrawal_nodes()
