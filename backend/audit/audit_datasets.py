"""
Dataset Audit Module for VAJRA Platform.
Inspects raw, processed, and feature datasets for integrity, sizes, schema, and statistics.
Output: backend/audit/dataset_audit.json
"""

import sys
import json
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import RAW_DIR, PROCESSED_DIR, REFERENCE_DIR, AUDIT_DIR

def run_dataset_audit() -> dict:
    print("[AUDIT] Auditing datasets...")
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)

    target_files = [
        ("Users Master", RAW_DIR / "trustvault" / "users.csv", "user_id"),
        ("Devices Master", RAW_DIR / "trustvault" / "devices.csv", "device_id"),
        ("Transactions Master", RAW_DIR / "transactions" / "transactions.csv", "transaction_id"),
        ("Onboarding Telemetry", RAW_DIR / "onboarding" / "onboarding_telemetry.csv", "onboarding_id"),
        ("Withdrawal Nodes Master", RAW_DIR / "spatial" / "withdrawal_nodes_master.csv", "node_id"),
        ("IP Geo Sessions", RAW_DIR / "spatial" / "ip_geo_sessions.csv", "session_id"),
        ("Cross-Border Sessions", RAW_DIR / "cross_border" / "cross_border_sessions.csv", "cross_border_event_id"),
        ("Complaints Master", RAW_DIR / "complaints" / "complaints.csv", "complaint_id"),
        ("Jurisdiction Units", RAW_DIR / "jurisdiction" / "jurisdiction_units.csv", "nearest_lea_unit_id"),
        ("Geofence Assignments", RAW_DIR / "jurisdiction" / "geofence_assignments.csv", "geofence_id"),
        ("Prediction Outcomes", RAW_DIR / "operations" / "prediction_outcomes.csv", "prediction_id"),
        ("Prediction Candidates", RAW_DIR / "operations" / "prediction_candidates.csv", "prediction_id"),
        ("Corridor Hub Events", RAW_DIR / "spatial" / "corridor_hubs.csv", "hub_event_id"),
        ("Syndicate Patterns", RAW_DIR / "investigation" / "syndicate_patterns.csv", "pattern_observation_id"),
        ("Audit Logs Master", RAW_DIR / "operations" / "audit_logs.csv", "event_id"),
        ("Legal Dossiers Master", RAW_DIR / "operations" / "legal_dossiers.csv", "dossier_id"),
        ("Clean Users", PROCESSED_DIR / "onboarding" / "users_clean.csv", "user_id"),
        ("Clean Transactions", PROCESSED_DIR / "transactions" / "transactions_clean.csv", "transaction_id"),
        ("Clean Withdrawal Nodes", PROCESSED_DIR / "spatial" / "withdrawal_nodes_clean.csv", "node_id"),
        ("Node Ranking Candidates", PROCESSED_DIR / "node_ranking_candidates.csv", "prediction_id"),
        ("Integrated Features", PROCESSED_DIR / "integrated" / "vajra_feature_dataset.csv", "account_id"),
        ("Ground Truth Targets", PROCESSED_DIR / "integrated" / "vajra_ground_truth.csv", "prediction_id")
    ]

    audit_records = []

    for name, filepath, pk in target_files:
        if not filepath.exists():
            audit_records.append({
                "dataset_name": name,
                "file_path": str(filepath.relative_to(PROJECT_ROOT)),
                "status": "MISSING"
            })
            continue

        df = pd.read_csv(filepath)
        r_cnt = len(df)
        c_cnt = len(df.columns)
        
        missing_count = int(df.isnull().sum().sum())
        missing_pct = round(float(missing_count / (r_cnt * c_cnt) * 100), 2) if r_cnt * c_cnt > 0 else 0.0
        
        dup_rows = int(df.duplicated().sum())
        dup_pks = int(df[pk].duplicated().sum()) if pk in df.columns else 0

        # Date range detection
        date_cols = [c for c in df.columns if "time" in c or "date" in c or "at" in c]
        date_min, date_max = None, None
        if date_cols:
            try:
                d_series = pd.to_datetime(df[date_cols[0]], errors="coerce").dropna()
                if not d_series.empty:
                    date_min = str(d_series.min())
                    date_max = str(d_series.max())
            except Exception:
                pass

        # Unique counts
        u_accounts = int(df["account_id"].nunique()) if "account_id" in df.columns else (int(df["sender_account_id"].nunique()) if "sender_account_id" in df.columns else None)
        u_nodes = int(df["node_id"].nunique()) if "node_id" in df.columns else (int(df["candidate_node_id"].nunique()) if "candidate_node_id" in df.columns else None)
        u_sessions = int(df["session_id"].nunique()) if "session_id" in df.columns else None
        u_txs = int(df["transaction_id"].nunique()) if "transaction_id" in df.columns else None

        audit_records.append({
            "dataset_name": name,
            "filename": filepath.name,
            "path": str(filepath.relative_to(PROJECT_ROOT)),
            "row_count": r_cnt,
            "column_count": c_cnt,
            "columns": list(df.columns),
            "dtypes": {c: str(df[c].dtype) for c in df.columns},
            "missing_values_pct": missing_pct,
            "duplicate_rows": dup_rows,
            "duplicate_primary_keys": dup_pks,
            "date_min": date_min,
            "date_max": date_max,
            "unique_accounts": u_accounts,
            "unique_nodes": u_nodes,
            "unique_sessions": u_sessions,
            "unique_transactions": u_txs,
            "synthetic_flag": True,
            "status": "PASS" if (r_cnt >= 25000 or name in ["Jurisdiction Units"]) else "WARN_SMALL_COUNT"
        })

    out_json = AUDIT_DIR / "dataset_audit.json"
    with open(out_json, "w") as f:
        json.dump(audit_records, f, indent=2)
    print(f"[AUDIT] Saved dataset audit -> {out_json}")
    return {"datasets_audited": len(audit_records), "records": audit_records}

if __name__ == "__main__":
    run_dataset_audit()
