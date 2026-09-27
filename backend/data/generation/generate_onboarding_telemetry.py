"""
Generate Raw Onboarding Telemetry Dataset.
Target File: data/raw/onboarding/onboarding_telemetry.csv
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

from data.generation.config import RAW_DIR, DEFAULT_ROWS, RANDOM_SEED, HOTSPOT_CLUSTERS
from data.generation.common_utils import set_seed, save_dataset

def generate_onboarding_telemetry(df_users: pd.DataFrame = None, num_rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[ONBOARDING] Generating {num_rows:,} onboarding telemetry records with seed {seed}...")
    
    if df_users is not None:
        user_ids = df_users["user_id"].values
        account_ids = df_users["account_id"].values
        device_ids = df_users["device_id"].values
        sim_ids = df_users["sim_id"].values
        declared_cities = df_users["city"].values
        declared_states = df_users["state"].values
        kyc_statuses = df_users["kyc_status"].values
        num_rows = max(num_rows, len(df_users))
    else:
        user_ids = [f"U{i:06d}" for i in range(num_rows)]
        account_ids = [f"ACC{i:06d}" for i in range(num_rows)]
        device_ids = [f"DEV{i:06d}" for i in range(num_rows)]
        sim_ids = [f"SIM{i:06d}" for i in range(num_rows)]
        cluster_cities = [c["city"] for c in HOTSPOT_CLUSTERS]
        cluster_states = [c["state"] for c in HOTSPOT_CLUSTERS]
        declared_cities = [np_rng.choice(cluster_cities) for _ in range(num_rows)]
        declared_states = [np_rng.choice(cluster_states) for _ in range(num_rows)]
        kyc_statuses = [np_rng.choice(["VERIFIED", "PENDING"]) for _ in range(num_rows)]

    base_date = datetime(2025, 1, 1)

    rows = []
    for i in range(num_rows):
        u_id = user_ids[i % len(user_ids)]
        a_id = account_ids[i % len(account_ids)]
        d_id = device_ids[i % len(device_ids)]
        s_id = sim_ids[i % len(sim_ids)]
        
        onb_id = f"ONB{i:06d}"
        ts = (base_date + timedelta(seconds=int(np_rng.randint(0, 500*86400)))).strftime("%Y-%m-%d %H:%M:%S")
        
        face_match = round(float(np_rng.beta(8, 2)), 4)
        ident_trust = round(float(np_rng.beta(7, 2)), 4)
        dev_trust = round(float(np_rng.beta(7, 3)), 4)
        
        emulator = 1 if np_rng.rand() < 0.03 else 0
        root = 1 if np_rng.rand() < 0.04 else 0
        cloner = 1 if np_rng.rand() < 0.03 else 0
        shared_dev = 1 if np_rng.rand() < 0.06 else 0
        shared_count = int(np_rng.randint(2, 10)) if shared_dev else 1
        
        sim_age = int(np_rng.randint(1, 1500))
        sim_binding = 0 if np_rng.rand() < 0.05 else 1
        sim_swap = 1 if np_rng.rand() < 0.03 else 0
        multi_sim = 1 if np_rng.rand() < 0.15 else 0
        
        vpn = 1 if np_rng.rand() < 0.05 else 0
        hosting = 1 if np_rng.rand() < 0.02 else 0
        proxy = 1 if np_rng.rand() < 0.03 else 0
        tor = 1 if np_rng.rand() < 0.005 else 0
        
        d_city = declared_cities[i % len(declared_cities)]
        d_state = declared_states[i % len(declared_states)]
        
        mismatch = 1 if np_rng.rand() < 0.08 else 0
        if mismatch:
            c_info = HOTSPOT_CLUSTERS[np_rng.randint(0, len(HOTSPOT_CLUSTERS))]
            obs_city, obs_state = c_info["city"], c_info["state"]
        else:
            obs_city, obs_state = d_city, d_state
            
        ip_risk = round(float(np_rng.beta(2, 8)), 4)
        typing_speed = round(float(np_rng.normal(250, 60)), 2)
        completion_time = int(np_rng.normal(120, 30))
        copy_paste = round(float(np_rng.beta(2, 5)), 4)
        otp_retry = int(np_rng.choice([0, 1, 2, 3], p=[0.75, 0.18, 0.05, 0.02]))
        
        pep = 1 if np_rng.rand() < 0.005 else 0
        sanction = 1 if np_rng.rand() < 0.001 else 0
        
        decision = "APPROVE"
        if sanction or emulator or (ip_risk > 0.85 and mismatch):
            decision = "REJECT"
        elif dev_trust < 0.40 or sim_swap or mismatch or otp_retry > 2:
            decision = "MANUAL_REVIEW"
            
        rows.append({
            "onboarding_id": onb_id,
            "user_id": u_id,
            "account_id": a_id,
            "timestamp": ts,
            "face_match_score": max(0.0, min(1.0, face_match)),
            "identity_trust_score": max(0.0, min(1.0, ident_trust)),
            "kyc_flag": 1 if kyc_statuses[i % len(kyc_statuses)] == "VERIFIED" else 0,
            "kyc_status": kyc_statuses[i % len(kyc_statuses)],
            "device_id": d_id,
            "device_trust_score": max(0.0, min(1.0, dev_trust)),
            "emulator_flag": emulator,
            "root_flag": root,
            "app_cloner_flag": cloner,
            "shared_device_flag": shared_dev,
            "shared_device_count": shared_count,
            "sim_id": s_id,
            "sim_age_days": sim_age,
            "sim_binding_ok": sim_binding,
            "sim_swap_flag": sim_swap,
            "multi_sim_flag": multi_sim,
            "vpn_flag": vpn,
            "hosting_flag": hosting,
            "proxy_flag": proxy,
            "tor_flag": tor,
            "geo_mismatch_flag": mismatch,
            "ip_risk_score": max(0.0, min(1.0, ip_risk)),
            "typing_speed": max(50.0, typing_speed),
            "form_completion_time": max(15, completion_time),
            "copy_paste_ratio": max(0.0, min(1.0, copy_paste)),
            "otp_retry_count": otp_retry,
            "pep_hit": pep,
            "sanction_hit": sanction,
            "onboarding_channel": np_rng.choice(["MOBILE_APP", "WEB_PORTAL", "CSP_KIOSK"], p=[0.80, 0.15, 0.05]),
            "declared_city": d_city,
            "declared_state": d_state,
            "observed_city": obs_city,
            "observed_state": obs_state,
            "onboarding_decision": decision
        })

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "onboarding" / "onboarding_telemetry.csv", min_rows=DEFAULT_ROWS, name="Onboarding Telemetry Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_onboarding_telemetry(num_rows=args.rows, seed=args.seed)
