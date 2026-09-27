"""
Generate Raw IP Geo Session Telemetry Dataset.
Target File: data/raw/spatial/ip_geo_sessions.csv
Target Rows: 50,000 (Min 30,000)
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

from data.generation.config import RAW_DIR, DEFAULT_ROWS, RANDOM_SEED, HOTSPOT_CLUSTERS, COUNTRIES
from data.generation.common_utils import set_seed, save_dataset, generate_synthetic_ip, add_geo_jitter

def generate_ip_geo_sessions(df_users: pd.DataFrame = None, num_rows: int = 50000, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[IP_GEO] Generating {num_rows:,} IP geo session records with seed {seed}...")
    
    if df_users is not None:
        user_ids = df_users["user_id"].values
        account_ids = df_users["account_id"].values
        device_ids = df_users["device_id"].values
    else:
        user_ids = [f"U{i:06d}" for i in range(30000)]
        account_ids = [f"ACC{i:06d}" for i in range(30000)]
        device_ids = [f"DEV{i:06d}" for i in range(30000)]

    base_start = datetime(2025, 1, 1)
    
    trajectories = [
        ["Delhi", "Alwar", "Bharatpur"],
        ["Mumbai", "Delhi", "Malda"],
        ["Gurugram", "Mewat_Nuh"],
        ["Delhi", "Jamtara"],
        ["Kolkata", "Deoghar", "Dhanbad"],
        ["Bengaluru", "Mumbai"]
    ]

    cluster_dict = {c["name"]: c for c in HOTSPOT_CLUSTERS}
    city_to_cluster = {c["city"]: c for c in HOTSPOT_CLUSTERS}

    rows = []
    num_accounts = len(account_ids)
    
    idx = 0
    while len(rows) < num_rows:
        acct_idx = idx % num_accounts
        u_id = user_ids[acct_idx]
        a_id = account_ids[acct_idx]
        d_id = device_ids[acct_idx]
        
        n_sessions = int(np_rng.randint(1, 4))
        traj = trajectories[np_rng.randint(0, len(trajectories))]
        
        curr_dt = base_start + timedelta(seconds=int(np_rng.randint(0, 400*86400)))
        prev_lat, prev_lon = None, None
        
        for seq in range(1, n_sessions + 1):
            if len(rows) >= num_rows:
                break
                
            sess_id = f"SESS{len(rows):08d}"
            
            loc_name = traj[(seq - 1) % len(traj)]
            c_info = cluster_dict.get(loc_name, city_to_cluster.get(loc_name, HOTSPOT_CLUSTERS[0]))
            
            is_foreign = 1 if np_rng.rand() < 0.05 else 0
            if is_foreign:
                cntry_info = COUNTRIES[np_rng.randint(1, len(COUNTRIES))]
                c_code = cntry_info["code"]
                c_name = cntry_info["name"]
                lat, lon = add_geo_jitter(25.2048, 55.2708, std_km=50.0)
            else:
                c_code = "IN"
                c_name = "India"
                lat, lon = add_geo_jitter(c_info["lat"], c_info["lon"], std_km=5.0)
                
            time_diff_sec = int(np_rng.exponential(scale=7200) + 60) if seq > 1 else 0
            curr_dt = curr_dt + timedelta(seconds=time_diff_sec)
            
            if prev_lat is not None and prev_lon is not None:
                dlat = (lat - prev_lat) * 111.0
                dlon = (lon - prev_lon) * 111.0 * np.cos(np.radians(lat))
                dist_km = round(float(np.sqrt(dlat**2 + dlon**2)), 2)
                angle_deg = round(float(np.degrees(np.arctan2(dlon, dlat)) % 360), 2)
            else:
                prev_lat, prev_lon = lat, lon
                dist_km = 0.0
                angle_deg = 0.0
                
            vpn = 1 if (is_foreign or np_rng.rand() < 0.06) else 0
            hosting = 1 if np_rng.rand() < 0.02 else 0
            proxy = 1 if np_rng.rand() < 0.03 else 0
            tor = 1 if np_rng.rand() < 0.005 else 0
            
            rows.append({
                "session_id": sess_id,
                "account_id": a_id,
                "user_id": u_id,
                "device_id": d_id,
                "ip_address": generate_synthetic_ip(np_rng),
                "session_timestamp": curr_dt.strftime("%Y-%m-%d %H:%M:%S"),
                "session_sequence_number": seq,
                "geo_lat": lat,
                "geo_lon": lon,
                "city": c_info["city"] if not is_foreign else c_name,
                "district": c_info["district"] if not is_foreign else c_name,
                "state": c_info["state"] if not is_foreign else c_name,
                "country": c_name,
                "country_code": c_code,
                "vpn_flag": vpn,
                "hosting_flag": hosting,
                "proxy_flag": proxy,
                "tor_flag": tor,
                "geo_accuracy_km": round(float(np_rng.uniform(0.5, 15.0)), 2),
                "previous_geo_lat": prev_lat if prev_lat is not None else lat,
                "previous_geo_lon": prev_lon if prev_lon is not None else lon,
                "distance_from_previous_km": dist_km,
                "time_since_previous_session_sec": time_diff_sec,
                "movement_direction_deg": angle_deg,
                "ip_asn_type": np_rng.choice(["RESIDENTIAL", "CELLULAR", "COMMERCIAL", "DATACENTER"], p=[0.55, 0.35, 0.07, 0.03]),
                "network_type": np_rng.choice(["4G", "5G", "WIFI", "BROADBAND"], p=[0.45, 0.35, 0.15, 0.05]),
                "is_foreign_session": is_foreign,
                "is_synthetic": 1
            })
            
            prev_lat, prev_lon = lat, lon
            
        idx += 1

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "spatial" / "ip_geo_sessions.csv", min_rows=DEFAULT_ROWS, name="IP Geo Sessions Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=50000)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_ip_geo_sessions(num_rows=args.rows, seed=args.seed)
