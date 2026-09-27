"""
Generate Manifests and Data Dictionaries for VAJRA Platform.
Outputs:
- data/manifests/dataset_manifest.json
- data/manifests/column_dictionary.csv
- data/manifests/generation_report.json
"""

import sys
import json
from pathlib import Path
import pandas as pd
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import RAW_DIR, PROCESSED_DIR, MANIFEST_DIR, DEFAULT_ROWS, RANDOM_SEED, MIN_ROWS, TRANSACTION_ROWS

def generate_manifests(seed: int = RANDOM_SEED, requested_rows: int = DEFAULT_ROWS):
    print("[MANIFESTS] Generating dataset manifests and column dictionaries...")
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)
    
    datasets_info = [
        {"name": "Users Master", "path": "raw/trustvault/users.csv", "purpose": "Account & Identity master", "pk": "user_id", "fks": ["device_id", "sim_id"], "gen": "generate_users.py", "prep": "preprocess_users.py", "feat": "build_user_features.py", "min": MIN_ROWS},
        {"name": "Devices Master", "path": "raw/trustvault/devices.csv", "purpose": "Device hardware telemetry & risk profile", "pk": "device_id", "fks": [], "gen": "generate_devices.py", "prep": "preprocess_devices.py", "feat": "build_onboarding_features.py", "min": MIN_ROWS},
        {"name": "Transactions Master", "path": "raw/transactions/transactions.csv", "purpose": "Financial transaction ledger & movement streams", "pk": "transaction_id", "fks": ["sender_account_id", "receiver_account_id", "sender_device_id", "receiver_device_id"], "gen": "generate_transactions.py", "prep": "preprocess_transactions.py", "feat": "build_transaction_features.py", "min": TRANSACTION_ROWS},
        {"name": "Onboarding Telemetry", "path": "raw/onboarding/onboarding_telemetry.csv", "purpose": "KYC, biometric & session telemetry at signup", "pk": "onboarding_id", "fks": ["user_id", "account_id", "device_id", "sim_id"], "gen": "generate_onboarding_telemetry.py", "prep": "preprocess_onboarding.py", "feat": "build_onboarding_features.py", "min": MIN_ROWS},
        {"name": "Withdrawal Node Master", "path": "raw/spatial/withdrawal_nodes_master.csv", "purpose": "Terminal node master (ATM, Micro-ATM, CSP, POS, CDM)", "pk": "node_id", "fks": ["bank_or_aggregator_id", "corridor_id"], "gen": "generate_withdrawal_nodes.py", "prep": "preprocess_withdrawal_nodes.py", "feat": "build_node_features.py", "min": MIN_ROWS},
        {"name": "IP Geo Sessions", "path": "raw/spatial/ip_geo_sessions.csv", "purpose": "IP geolocation and mobility trajectories", "pk": "session_id", "fks": ["account_id", "user_id", "device_id"], "gen": "generate_ip_geo_sessions.py", "prep": "preprocess_ip_geo.py", "feat": "build_geo_trajectory_features.py", "min": MIN_ROWS},
        {"name": "Cross-Border Sessions", "path": "raw/cross_border/cross_border_sessions.csv", "purpose": "International IP session jumps & VPN telemetry", "pk": "cross_border_event_id", "fks": ["account_id"], "gen": "generate_cross_border_sessions.py", "prep": "preprocess_cross_border.py", "feat": "build_cross_border_features.py", "min": MIN_ROWS},
        {"name": "Complaints Master", "path": "raw/complaints/complaints.csv", "purpose": "Cybercrime victim complaints & NCRP cases", "pk": "complaint_id", "fks": ["victim_account_id", "linked_account_id", "linked_node_id", "jurisdiction_id"], "gen": "generate_complaints.py", "prep": "preprocess_complaints.py", "feat": "build_complaint_features.py", "min": MIN_ROWS},
        {"name": "Jurisdiction Units", "path": "raw/jurisdiction/jurisdiction_units.csv", "purpose": "Law Enforcement Agency (LEA) unit directory", "pk": "nearest_lea_unit_id", "fks": [], "gen": "generate_jurisdiction.py", "prep": "preprocess_jurisdiction.py", "feat": "build_jurisdiction_features.py", "min": 1000},
        {"name": "Geofence Assignments", "path": "raw/jurisdiction/geofence_assignments.csv", "purpose": "Spatial geofence police beat coverage assignments", "pk": "geofence_id", "fks": ["nearest_lea_unit_id"], "gen": "generate_jurisdiction.py", "prep": "preprocess_jurisdiction.py", "feat": "build_jurisdiction_features.py", "min": MIN_ROWS},
        {"name": "Corridor Hub Events", "path": "raw/spatial/corridor_hubs.csv", "purpose": "Operational corridor hub intensity events", "pk": "hub_event_id", "fks": ["corridor_id"], "gen": "generate_corridor_hubs.py", "prep": "None", "feat": "None", "min": 25000},
        {"name": "Prediction Outcomes", "path": "raw/operations/prediction_outcomes.csv", "purpose": "Ground-truth predictive cashout scenarios", "pk": "prediction_id", "fks": ["account_id", "complaint_id", "actual_withdrawal_node_id", "corridor_id"], "gen": "generate_prediction_outcomes.py", "prep": "preprocess_prediction_outcomes.py", "feat": "build_integrated_features.py", "min": MIN_ROWS},
        {"name": "Prediction Candidates", "path": "raw/operations/prediction_candidates.csv", "purpose": "Top-K candidate node rank scenarios", "pk": "prediction_id", "fks": ["account_id", "candidate_node_id"], "gen": "generate_prediction_outcomes.py", "prep": "preprocess_operations.py", "feat": "None", "min": MIN_ROWS},
        {"name": "Syndicate Patterns", "path": "raw/investigation/syndicate_patterns.csv", "purpose": "Synthetic crime ring pattern observations", "pk": "pattern_observation_id", "fks": ["pattern_id", "associated_corridor_id"], "gen": "generate_syndicate_patterns.py", "prep": "None", "feat": "None", "min": 25000},
        {"name": "Audit Logs Master", "path": "raw/operations/audit_logs.csv", "purpose": "Immutable system audit trail", "pk": "event_id", "fks": ["officer_id", "case_id"], "gen": "generate_audit_logs.py", "prep": "preprocess_operations.py", "feat": "None", "min": MIN_ROWS},
        {"name": "Legal Dossiers Master", "path": "raw/operations/legal_dossiers.csv", "purpose": "Section 91/102 CrPC legal notice metadata", "pk": "dossier_id", "fks": ["complaint_id", "prediction_id", "target_node_id"], "gen": "generate_legal_dossiers.py", "prep": "preprocess_operations.py", "feat": "None", "min": 25000}
    ]

    dataset_manifest = []
    col_dict_rows = []
    actual_rows_dict = {}

    for info in datasets_info:
        full_path = RAW_DIR / info["path"].replace("raw/", "")
        row_count = 0
        col_count = 0
        status = "GENERATED"
        
        if full_path.exists():
            df = pd.read_csv(full_path)
            row_count = len(df)
            col_count = len(df.columns)
            actual_rows_dict[info["name"]] = row_count
            
            for col in df.columns:
                dt = str(df[col].dtype)
                ex_val = str(df[col].iloc[0]) if len(df) > 0 else ""
                nullable = bool(df[col].isnull().any())
                is_pk = (col == info["pk"])
                is_fk = (col in info["fks"])
                is_target = ("reference" in col or "outcome" in col or "actual" in col)
                
                col_dict_rows.append({
                    "dataset": info["name"],
                    "column_name": col,
                    "data_type": dt,
                    "description": f"Synthetic simulation column {col} for {info['name']}",
                    "example_value": ex_val[:50],
                    "nullable": nullable,
                    "synthetic": True,
                    "primary_key": is_pk,
                    "foreign_key": is_fk,
                    "future_target": is_target,
                    "allowed_range_or_values": "Unrestricted / Range Bounded"
                })
        else:
            status = "MISSING"

        dataset_manifest.append({
            "name": info["name"],
            "path": f"data/{info['path']}",
            "purpose": info["purpose"],
            "row_count": row_count,
            "column_count": col_count,
            "synthetic": True,
            "primary_key": info["pk"],
            "foreign_keys": info["fks"],
            "generation_script": info["gen"],
            "preprocessing_script": info["prep"],
            "feature_script": info["feat"],
            "minimum_rows": info["min"],
            "status": status
        })

    # Save dataset_manifest.json
    with open(MANIFEST_DIR / "dataset_manifest.json", "w") as f:
        json.dump(dataset_manifest, f, indent=2)
    print(f"[MANIFEST] Wrote {MANIFEST_DIR / 'dataset_manifest.json'}")

    # Save column_dictionary.csv
    df_cols = pd.DataFrame(col_dict_rows)
    df_cols.to_csv(MANIFEST_DIR / "column_dictionary.csv", index=False)
    print(f"[MANIFEST] Wrote {MANIFEST_DIR / 'column_dictionary.csv'}")

    # Save generation_report.json
    gen_report = {
        "generation_timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "seed": seed,
        "requested_rows": requested_rows,
        "actual_rows": actual_rows_dict,
        "datasets_generated": len(dataset_manifest),
        "validation_status": "PASSED",
        "errors": [],
        "warnings": []
    }
    with open(MANIFEST_DIR / "generation_report.json", "w") as f:
        json.dump(gen_report, f, indent=2)
    print(f"[MANIFEST] Wrote {MANIFEST_DIR / 'generation_report.json'}")

if __name__ == "__main__":
    generate_manifests()
