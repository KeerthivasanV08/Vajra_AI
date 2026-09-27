"""
Generate Raw Legal Dossiers Metadata Dataset.
Target File: data/raw/operations/legal_dossiers.csv
Minimum Rows: 25,000
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
from data.generation.common_utils import set_seed, save_dataset

def generate_legal_dossiers(df_complaints: pd.DataFrame = None, df_nodes: pd.DataFrame = None, num_rows: int = 25000, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[DOSSIERS] Generating {num_rows:,} synthetic legal dossier metadata records with seed {seed}...")
    
    complaints = df_complaints["complaint_id"].values if df_complaints is not None else [f"CMP{i:06d}" for i in range(30000)]
    node_ids = df_nodes["node_id"].values if df_nodes is not None else [f"NODE{i:06d}" for i in range(30000)]
    
    base_date = datetime(2025, 1, 1)

    rows = []
    for i in range(num_rows):
        dos_id = f"DOS{i:06d}"
        cmp_id = complaints[i % len(complaints)]
        pred_id = f"PRED{i % len(complaints):06d}"
        node_id = node_ids[i % len(node_ids)]
        
        gen_dt = (base_date + timedelta(seconds=int(np_rng.randint(0, 450*86400)))).strftime("%Y-%m-%d %H:%M:%S")
        notice_ref = f"NOTICE/91A/{2025}/{i:06d}"
        
        ev_hash = hashlib.sha256(f"{dos_id}_{cmp_id}_{notice_ref}".encode()).hexdigest()
        secs = np_rng.choice(["SEC_91_CRPC", "SEC_102_CRPC", "SEC_91_102_COMBINED", "BNSS_SEC_94"], p=[0.40, 0.35, 0.15, 0.10])
        off_id = f"OFFICER_{np_rng.randint(100, 999)}"
        
        dir_type = np_rng.choice(["IMMEDIATE_ACCOUNT_FREEZE", "ATM_CCTV_PRESERVATION", "CSP_TRANSACTION_LOG", "IP_GEO_INTERCEPT"], p=[0.35, 0.30, 0.20, 0.15])
        dl_count = int(np_rng.randint(1, 10))
        verif_status = np_rng.choice(["VERIFIED_VALID", "PENDING_COURT_SEAL", "REJECTED_DEFECTIVE"], p=[0.85, 0.12, 0.03])
        
        rows.append({
            "dossier_id": dos_id,
            "complaint_id": cmp_id,
            "generated_at": gen_dt,
            "notice_ref_no": notice_ref,
            "evidence_hash_sha256_reference": ev_hash,
            "sections_included": secs,
            "issuing_officer_id": off_id,
            "prediction_id": pred_id,
            "target_node_id": node_id,
            "preservation_directive_type": dir_type,
            "download_count": dl_count,
            "verification_status_reference": verif_status,
            "is_synthetic": 1
        })

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "operations" / "legal_dossiers.csv", min_rows=25000, name="Legal Dossiers Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=25000)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_legal_dossiers(num_rows=args.rows, seed=args.seed)
