"""
Generate Raw Users / Account Master Dataset.
Target File: data/raw/trustvault/users.csv
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
    SYNTHETIC_PROFILE_TYPES
)
from data.generation.common_utils import set_seed, save_dataset, generate_synthetic_ip

def generate_users(num_rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[USERS] Generating {num_rows:,} user accounts with seed {seed}...")
    
    user_ids = [f"U{i:06d}" for i in range(num_rows)]
    account_ids = [f"ACC{i:06d}" for i in range(num_rows)]
    device_ids = [f"DEV{i:06d}" for i in range(num_rows)]
    sim_ids = [f"SIM{i:06d}" for i in range(num_rows)]
    
    profile_weights = [0.45, 0.15, 0.10, 0.05, 0.05, 0.08, 0.07, 0.03, 0.02]
    synthetic_profiles = np_rng.choice(SYNTHETIC_PROFILE_TYPES, size=num_rows, p=profile_weights)
    
    customer_types = np_rng.choice(["INDIVIDUAL", "SOLE_PROP", "PARTNERSHIP", "PVT_LTD"], size=num_rows, p=[0.85, 0.08, 0.04, 0.03])
    account_statuses = np_rng.choice(["ACTIVE", "SUSPENDED", "DORMANT", "CLOSED"], size=num_rows, p=[0.92, 0.04, 0.03, 0.01])
    kyc_statuses = np_rng.choice(["VERIFIED", "PENDING", "REJECTED", "EXPIRED"], size=num_rows, p=[0.88, 0.07, 0.03, 0.02])
    genders = np_rng.choice(["M", "F", "OTHER"], size=num_rows, p=[0.60, 0.38, 0.02])
    
    base_date = datetime(2025, 1, 1)
    
    rows = []
    for i in range(num_rows):
        profile = synthetic_profiles[i]
        cluster = HOTSPOT_CLUSTERS[i % len(HOTSPOT_CLUSTERS)]
        
        account_age_days = int(np_rng.exponential(scale=365) + 1)
        if profile == "NEW_CUSTOMER":
            account_age_days = int(np_rng.randint(1, 30))
        elif profile in ["POTENTIAL_MULE", "MULE_LIKE"]:
            account_age_days = int(np_rng.randint(5, 90))
            
        created_dt = base_date - timedelta(days=account_age_days)
        created_at_str = created_dt.strftime("%Y-%m-%d %H:%M:%S")
        
        kyc_verified_at = (created_dt + timedelta(hours=int(np_rng.randint(1, 48)))).strftime("%Y-%m-%d %H:%M:%S") if kyc_statuses[i] == "VERIFIED" else ""
        
        sim_swap = bool(np_rng.choice([True, False], p=[0.18 if profile in ["POTENTIAL_MULE", "MULE_LIKE"] else 0.02, 0.82 if profile in ["POTENTIAL_MULE", "MULE_LIKE"] else 0.98]))
        multi_sim = bool(np_rng.choice([True, False], p=[0.25 if profile in ["POTENTIAL_MULE", "MULE_LIKE"] else 0.05, 0.75 if profile in ["POTENTIAL_MULE", "MULE_LIKE"] else 0.95]))
        sim_binding = not sim_swap
        
        dom_ratio = round(float(np_rng.uniform(0.1, 0.5) if profile in ["POTENTIAL_MULE", "MULE_LIKE"] else np_rng.uniform(0.85, 1.0)), 4)
        is_whitelist = 1 if (profile == "NORMAL" and np_rng.rand() < 0.05) else 0
        
        dob_dt = base_date - timedelta(days=int(np_rng.randint(18*365, 65*365)))
        
        rows.append({
            "user_id": user_ids[i],
            "account_id": account_ids[i],
            "customer_type": customer_types[i],
            "full_name": fake.name(),
            "date_of_birth": dob_dt.strftime("%Y-%m-%d"),
            "gender": genders[i],
            "city": cluster["city"],
            "district": cluster["district"],
            "state": cluster["state"],
            "pincode": cluster["pincode"],
            "country": "India",
            "created_at": created_at_str,
            "account_status": account_statuses[i],
            "kyc_status": kyc_statuses[i],
            "kyc_verified_at": kyc_verified_at,
            "has_pan": 1 if np_rng.rand() < 0.90 else 0,
            "has_aadhaar": 1 if np_rng.rand() < 0.98 else 0,
            "device_id": device_ids[i],
            "primary_ip": generate_synthetic_ip(np_rng),
            "sim_id": sim_ids[i],
            "sim_binding_ok": 1 if sim_binding else 0,
            "sim_swap_flag": 1 if sim_swap else 0,
            "multi_sim_flag": 1 if multi_sim else 0,
            "account_age_days": account_age_days,
            "domestic_session_ratio": dom_ratio,
            "is_whitelisted": is_whitelist,
            "synthetic_profile_type": profile
        })
        
    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "trustvault" / "users.csv", min_rows=DEFAULT_ROWS, name="Users Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_users(args.rows, args.seed)
