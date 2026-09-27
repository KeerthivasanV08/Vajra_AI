"""
Generate Raw Withdrawal Node Master Dataset.
Target File: data/raw/spatial/withdrawal_nodes_master.csv
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

from data.generation.config import (
    RAW_DIR, DEFAULT_ROWS, RANDOM_SEED, HOTSPOT_CLUSTERS,
    NODE_TYPES, BANKS, CORRIDORS
)
from data.generation.common_utils import set_seed, save_dataset, add_geo_jitter

def generate_withdrawal_nodes(num_rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[NODES] Generating {num_rows:,} withdrawal node records with seed {seed}...")
    
    base_date = datetime(2025, 6, 1)
    
    rows = []
    for i in range(num_rows):
        node_id = f"NODE{i:06d}"
        node_type = str(np_rng.choice(NODE_TYPES, p=[0.35, 0.25, 0.20, 0.12, 0.08]))
        
        bank_info = BANKS[i % len(BANKS)]
        bank_id = bank_info["id"]
        bank_name = bank_info["name"]
        
        bc_id = f"BC{np_rng.randint(1000, 9999)}" if node_type in ["MICRO_ATM", "AEPS_CSP"] else ""
        
        cluster = HOTSPOT_CLUSTERS[i % len(HOTSPOT_CLUSTERS)]
        lat, lon = add_geo_jitter(cluster["lat"], cluster["lon"], std_km=15.0)
        
        hist_vol = int(np_rng.exponential(scale=10000) + 50)
        avg_daily = round(float(hist_vol / max(1, np_rng.randint(30, 365))), 2)
        avg_amt = round(float(np_rng.uniform(1500, 25000)), 2)
        
        off_hour_ratio = round(float(np_rng.beta(2, 6)), 4)
        hist_cash = int(hist_vol * np_rng.uniform(0.4, 0.95))
        
        # synthetic reference vulnerability calculation (transparent rule)
        fraud_cashouts = int(np_rng.poisson(lam=2.5 if cluster["name"] in ["Mewat_Nuh", "Jamtara", "Alwar", "Malda"] else 0.4))
        prev_flags = int(np_rng.randint(0, 5) if fraud_cashouts > 0 else 0)
        
        corr_info = CORRIDORS[i % len(CORRIDORS)]
        corr_id = corr_info["id"]
        
        # calculate approximate distance to corridor centroid in km
        dlat = (lat - corr_info["lat"]) * 111.0
        dlon = (lon - corr_info["lon"]) * 111.0 * np.cos(np.radians(lat))
        dist_corr_km = round(float(np.sqrt(dlat**2 + dlon**2)), 2)
        
        daily_limit = float(np_rng.choice([100000, 250000, 500000, 1000000]))
        op_start = "00:00:00" if node_type in ["ATM", "CDM"] else "08:00:00"
        op_end = "23:59:59" if node_type in ["ATM", "CDM"] else "20:00:00"
        weekend_act = 1 if node_type in ["ATM", "CDM"] else (1 if np_rng.rand() < 0.70 else 0)
        
        # vulnerability score reference (rule-based synthetic formula, NOT ML)
        vuln_ref = round(float(min(1.0, 0.1 + (fraud_cashouts * 0.15) + (off_hour_ratio * 0.3) + (0.2 if dist_corr_km < 20 else 0.0))), 4)
        
        last_upd = (base_date - timedelta(days=int(np_rng.randint(0, 90)))).strftime("%Y-%m-%d %H:%M:%S")
        
        rows.append({
            "node_id": node_id,
            "node_type": node_type,
            "bank_or_aggregator_id": bank_id,
            "bank_name": bank_name,
            "bc_id": bc_id,
            "latitude": lat,
            "longitude": lon,
            "pincode": cluster["pincode"],
            "city": cluster["city"],
            "district": cluster["district"],
            "state": cluster["state"],
            "country": "India",
            "historical_txn_volume": hist_vol,
            "average_daily_transactions": avg_daily,
            "average_transaction_amount": avg_amt,
            "off_hour_withdrawal_ratio": off_hour_ratio,
            "historical_cash_withdrawals": hist_cash,
            "historical_fraud_cashouts": fraud_cashouts,
            "previous_fraud_flags": prev_flags,
            "distance_to_known_corridor_km": dist_corr_km,
            "corridor_id": corr_id,
            "cash_limit_daily": daily_limit,
            "operating_hours_start": op_start,
            "operating_hours_end": op_end,
            "weekend_active": weekend_act,
            "vulnerability_score_reference": vuln_ref,
            "last_updated": last_upd,
            "is_active": 1 if np_rng.rand() < 0.95 else 0,
            "is_synthetic": 1
        })

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "spatial" / "withdrawal_nodes_master.csv", min_rows=DEFAULT_ROWS, name="Withdrawal Node Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_withdrawal_nodes(num_rows=args.rows, seed=args.seed)
