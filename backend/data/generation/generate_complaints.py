"""
Generate Raw Complaint / Case Master Dataset.
Target File: data/raw/complaints/complaints.csv
Minimum Rows: 30,000
"""

import sys
import argparse
from pathlib import Path
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import RAW_DIR, DEFAULT_ROWS, RANDOM_SEED, HOTSPOT_CLUSTERS, FRAUD_CATEGORIES
from data.generation.common_utils import set_seed, save_dataset, add_geo_jitter

def generate_complaints(df_users: pd.DataFrame = None, df_nodes: pd.DataFrame = None, num_rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[COMPLAINTS] Generating {num_rows:,} complaint records with seed {seed}...")
    
    if df_users is not None:
        accounts = df_users["account_id"].values
    else:
        accounts = [f"ACC{i:06d}" for i in range(30000)]
        
    if df_nodes is not None:
        nodes = df_nodes["node_id"].values
    else:
        nodes = [f"NODE{i:06d}" for i in range(30000)]

    base_date = datetime(2025, 1, 1)

    rows = []
    for i in range(num_rows):
        cmp_id = f"CMP{i:06d}"
        
        v_acc = np_rng.choice(accounts)
        l_acc = np_rng.choice(accounts)
        while l_acc == v_acc:
            l_acc = np_rng.choice(accounts)
            
        cluster = HOTSPOT_CLUSTERS[i % len(HOTSPOT_CLUSTERS)]
        v_lat, v_lon = add_geo_jitter(cluster["lat"], cluster["lon"], std_km=10.0)
        
        inc_dt = base_date + timedelta(seconds=int(np_rng.randint(0, 450*86400)))
        rep_dt = inc_dt + timedelta(hours=int(np_rng.randint(1, 72)))
        
        cat = np_rng.choice(FRAUD_CATEGORIES, p=[0.25, 0.20, 0.15, 0.12, 0.08, 0.05, 0.05, 0.04, 0.04, 0.02])
        amt = round(float(np_rng.exponential(scale=25000) + 500), 2)
        
        fir = np_rng.choice(["REGISTERED", "PENDING", "NOT_FILED"], p=[0.35, 0.45, 0.20])
        status = np_rng.choice(["OPEN", "UNDER_INVESTIGATION", "FREEZE_INITIATED", "RESOLVED", "CLOSED"], p=[0.30, 0.35, 0.15, 0.12, 0.08])
        
        node_id = np_rng.choice(nodes)
        lea_id = f"LEA{(i % 1000) + 1:03d}"
        
        sop_tier = np_rng.choice(["TIER_1_IMMEDIATE_HOLD", "TIER_2_URGENT_FREEZE", "TIER_3_MONITORING"], p=[0.25, 0.45, 0.30])
        
        rows.append({
            "complaint_id": cmp_id,
            "timestamp": inc_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "victim_account_id": v_acc,
            "linked_account_id": l_acc,
            "victim_city": cluster["city"],
            "victim_district": cluster["district"],
            "victim_state": cluster["state"],
            "victim_lat": v_lat,
            "victim_lon": v_lon,
            "fraud_category": cat,
            "amount_reported": amt,
            "initial_beneficiary_account_id": l_acc,
            "fir_status": fir,
            "complaint_status": status,
            "channel": np_rng.choice(["NCRP_PORTAL", "HELPLINE_1930", "POLICE_STATION", "BANK_BRANCH"], p=[0.50, 0.35, 0.10, 0.05]),
            "complaint_source": np_rng.choice(["NCRP", "LEA_DIRECT", "BANK_ALERT"], p=[0.65, 0.25, 0.10]),
            "reported_at": rep_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "linked_transaction_count": int(np_rng.randint(1, 15)),
            "linked_node_id": node_id,
            "jurisdiction_id": lea_id,
            "sop_tier_reference": sop_tier,
            "is_synthetic": 1
        })

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "complaints" / "complaints.csv", min_rows=DEFAULT_ROWS, name="Complaints Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_complaints(num_rows=args.rows, seed=args.seed)
