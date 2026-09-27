"""
Generate Raw Audit Log Dataset.
Target File: data/raw/operations/audit_logs.csv
Minimum Rows: 30,000
"""

import sys
import argparse
from pathlib import Path
import hashlib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import RAW_DIR, DEFAULT_ROWS, RANDOM_SEED
from data.generation.common_utils import set_seed, save_dataset, generate_synthetic_ip

def generate_audit_logs(num_rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[AUDIT_LOGS] Generating {num_rows:,} synthetic audit log records with seed {seed}...")
    
    base_date = datetime(2025, 1, 1)
    officer_roles = ["INVESTIGATOR", "ANALYST", "LEA_OFFICER", "SYSTEM_AUTOMATION", "SUPERVISOR"]
    action_types = ["SEARCH_ACCOUNT", "INITIATE_FREEZE", "VIEW_PREDICTION", "EXPORT_DOSSIER", "MARK_INTERCEPTED", "UPDATE_RISK_BAND"]
    target_types = ["ACCOUNT", "TRANSACTION", "COMPLAINT", "NODE", "PREDICTION"]

    rows = []
    prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"

    for i in range(num_rows):
        evt_id = f"AUD_{i:08d}"
        ts = (base_date + timedelta(seconds=int(i * 350 + np_rng.randint(0, 100)))).strftime("%Y-%m-%d %H:%M:%S")
        
        off_id = f"OFFICER_{np_rng.randint(100, 999)}"
        role = np_rng.choice(officer_roles, p=[0.35, 0.30, 0.15, 0.12, 0.08])
        act = np_rng.choice(action_types)
        tgt_type = np_rng.choice(target_types)
        tgt_id = f"{tgt_type[:3]}_{np_rng.randint(100000, 999999)}"
        case_id = f"CASE_{np_rng.randint(10000, 99999)}"
        
        ip_addr = generate_synthetic_ip(np_rng)
        payload = f"{evt_id}|{ts}|{off_id}|{role}|{act}|{tgt_type}|{tgt_id}|{case_id}"
        payload_hash = hashlib.sha256(payload.encode()).hexdigest()
        
        curr_hash_str = f"{payload_hash}|{prev_hash}"
        curr_hash = hashlib.sha256(curr_hash_str.encode()).hexdigest()
        
        rows.append({
            "event_id": evt_id,
            "timestamp": ts,
            "officer_id": off_id,
            "officer_role": role,
            "action_type": act,
            "target_entity_type": tgt_type,
            "target_entity_id": tgt_id,
            "case_id": case_id,
            "ip_address_synthetic": ip_addr,
            "event_payload_hash_reference": payload_hash,
            "event_hash_sha256_reference": curr_hash,
            "prev_hash_sha256_reference": prev_hash,
            "verified_flag_reference": 1,
            "is_synthetic": 1
        })
        
        prev_hash = curr_hash

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "operations" / "audit_logs.csv", min_rows=DEFAULT_ROWS, name="Audit Logs Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_audit_logs(num_rows=args.rows, seed=args.seed)
