"""
Preprocess Operations Datasets (Candidates, Audit Logs, Legal Dossiers).
Outputs:
- data/processed/operations/prediction_candidates_clean.csv
- data/processed/operations/audit_logs_clean.csv
- data/processed/operations/legal_dossiers_clean.csv
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

def preprocess_operations() -> tuple:
    # 1. Candidates
    raw_cand = RAW_DIR / "operations" / "prediction_candidates.csv"
    print(f"[PREPROCESS] Loading prediction candidates from {raw_cand}...")
    df_c = load_raw_csv(raw_cand)
    df_c = clean_column_names(df_c)
    df_c = deduplicate_exact(df_c)
    df_c = parse_timestamps(df_c, ["predicted_window_start", "predicted_window_end"])
    df_c["candidate_lat"] = df_c["candidate_lat"].clip(-90.0, 90.0)
    df_c["candidate_lon"] = df_c["candidate_lon"].clip(-180.0, 180.0)
    df_c["candidate_reference_score"] = df_c["candidate_reference_score"].clip(0.0, 1.0)
    save_clean_csv(df_c, PROCESSED_DIR / "operations" / "prediction_candidates_clean.csv", name="Prediction Candidates Cleaned")

    # 2. Audit Logs
    raw_audit = RAW_DIR / "operations" / "audit_logs.csv"
    print(f"[PREPROCESS] Loading audit logs from {raw_audit}...")
    df_a = load_raw_csv(raw_audit)
    df_a = clean_column_names(df_a)
    df_a = deduplicate_exact(df_a)
    df_a = parse_timestamps(df_a, ["timestamp"])
    df_a = df_a.sort_values(by="timestamp").reset_index(drop=True)
    save_clean_csv(df_a, PROCESSED_DIR / "operations" / "audit_logs_clean.csv", name="Audit Logs Cleaned")

    # 3. Legal Dossiers
    raw_dos = RAW_DIR / "operations" / "legal_dossiers.csv"
    print(f"[PREPROCESS] Loading legal dossiers from {raw_dos}...")
    df_d = load_raw_csv(raw_dos)
    df_d = clean_column_names(df_d)
    df_d = deduplicate_exact(df_d)
    df_d = parse_timestamps(df_d, ["generated_at"])
    df_d["download_count"] = df_d["download_count"].clip(lower=0).astype(int)
    save_clean_csv(df_d, PROCESSED_DIR / "operations" / "legal_dossiers_clean.csv", name="Legal Dossiers Cleaned")

    return df_c, df_a, df_d

if __name__ == "__main__":
    preprocess_operations()
