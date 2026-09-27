"""
Validate Schema & Expected Columns across VAJRA Datasets.
"""

import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import RAW_DIR, PROCESSED_DIR

def validate_schema() -> bool:
    print("[VALIDATE] Checking dataset schemas...")
    
    schema_checks = {
        RAW_DIR / "trustvault" / "users.csv": ["user_id", "account_id", "device_id", "sim_id", "city", "state", "account_status", "kyc_status", "synthetic_profile_type"],
        RAW_DIR / "trustvault" / "devices.csv": ["device_id", "device_type", "os_type", "manufacturer", "hardware_hash", "synthetic_device_risk_group"],
        RAW_DIR / "transactions" / "transactions.csv": ["transaction_id", "timestamp", "sender_account_id", "receiver_account_id", "amount", "transaction_type", "channel", "is_synthetic"],
        RAW_DIR / "onboarding" / "onboarding_telemetry.csv": ["onboarding_id", "user_id", "account_id", "device_id", "face_match_score", "identity_trust_score", "onboarding_decision"],
        RAW_DIR / "spatial" / "withdrawal_nodes_master.csv": ["node_id", "node_type", "latitude", "longitude", "city", "state", "vulnerability_score_reference"],
        RAW_DIR / "spatial" / "ip_geo_sessions.csv": ["session_id", "account_id", "user_id", "device_id", "ip_address", "session_timestamp", "geo_lat", "geo_lon"],
        RAW_DIR / "cross_border" / "cross_border_sessions.csv": ["cross_border_event_id", "account_id", "session_timestamp", "previous_country", "current_country"],
        RAW_DIR / "complaints" / "complaints.csv": ["complaint_id", "timestamp", "victim_account_id", "linked_account_id", "fraud_category", "amount_reported"],
        RAW_DIR / "jurisdiction" / "jurisdiction_units.csv": ["nearest_lea_unit_id", "unit_name", "district", "state", "latitude", "longitude"],
        RAW_DIR / "jurisdiction" / "geofence_assignments.csv": ["geofence_id", "latitude", "longitude", "radius_km", "nearest_lea_unit_id"],
        RAW_DIR / "operations" / "prediction_outcomes.csv": ["prediction_id", "account_id", "complaint_id", "actual_withdrawal_node_id", "intervention_outcome"],
        RAW_DIR / "operations" / "prediction_candidates.csv": ["prediction_id", "account_id", "candidate_rank", "candidate_node_id"],
        RAW_DIR / "spatial" / "corridor_hubs.csv": ["hub_event_id", "corridor_id", "timestamp"],
        RAW_DIR / "investigation" / "syndicate_patterns.csv": ["pattern_observation_id", "pattern_id", "pattern_type"],
        RAW_DIR / "operations" / "audit_logs.csv": ["event_id", "timestamp", "officer_id", "action_type", "event_hash_sha256_reference"],
        RAW_DIR / "operations" / "legal_dossiers.csv": ["dossier_id", "complaint_id", "notice_ref_no", "evidence_hash_sha256_reference"]
    }
    
    all_passed = True
    for filepath, req_cols in schema_checks.items():
        if not filepath.exists():
            print(f"  [FAIL] Missing file: {filepath.name}")
            all_passed = False
            continue
            
        df = pd.read_csv(filepath, nrows=5)
        missing = [c for c in req_cols if c not in df.columns]
        if missing:
            print(f"  [FAIL] {filepath.name} missing columns: {missing}")
            all_passed = False
        else:
            print(f"  [PASS] {filepath.name} ({len(df.columns)} columns verified)")

    return all_passed

if __name__ == "__main__":
    validate_schema()
