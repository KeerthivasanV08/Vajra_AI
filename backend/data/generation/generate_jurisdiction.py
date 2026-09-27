"""
Generate Raw Jurisdiction Units and Geofence Assignments Datasets.
Target Files:
- data/raw/jurisdiction/jurisdiction_units.csv (1,000 LEA units)
- data/raw/jurisdiction/geofence_assignments.csv (>=25,000 assignments)
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
from data.generation.common_utils import set_seed, save_dataset, add_geo_jitter

def generate_jurisdiction(num_rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED) -> tuple:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[JURISDICTION] Generating LEA units and {num_rows:,} geofence assignments with seed {seed}...")
    
    # 1. Jurisdiction LEA Units (1000 units)
    num_units = 1000
    lea_rows = []
    unit_types = ["CYBER_CRIME_CELL", "POLICE_STATION", "DISTRICT_HQ", "SPECIAL_TASK_FORCE"]
    
    for i in range(1, num_units + 1):
        lea_id = f"LEA{i:03d}"
        cluster = HOTSPOT_CLUSTERS[i % len(HOTSPOT_CLUSTERS)]
        lat, lon = add_geo_jitter(cluster["lat"], cluster["lon"], std_km=8.0)
        u_type = np_rng.choice(unit_types, p=[0.40, 0.35, 0.15, 0.10])
        
        lea_rows.append({
            "nearest_lea_unit_id": lea_id,
            "unit_name": f"{cluster['district']} {u_type.replace('_', ' ').title()} Unit-{i}",
            "unit_type": u_type,
            "district": cluster["district"],
            "state": cluster["state"],
            "latitude": lat,
            "longitude": lon,
            "beat_code": f"BEAT_{cluster['district'][:3].upper()}_{i%50:02d}",
            "contact_channel": np_rng.choice(["PHONE", "EMAIL", "DISPATCH_RADIO"], p=[0.60, 0.30, 0.10]),
            "contact_phone_synthetic": f"+9198765{i:05d}",
            "is_active": 1
        })
        
    df_units = pd.DataFrame(lea_rows)
    save_dataset(df_units, RAW_DIR / "jurisdiction" / "jurisdiction_units.csv", min_rows=1000, name="Jurisdiction LEA Units")

    # 2. Geofence Assignments (>= 25,000)
    base_date = datetime(2025, 1, 1)
    gf_rows = []
    unit_ids = df_units["nearest_lea_unit_id"].values
    
    for i in range(num_rows):
        gf_id = f"GF{i:06d}"
        cluster = HOTSPOT_CLUSTERS[i % len(HOTSPOT_CLUSTERS)]
        lat, lon = add_geo_jitter(cluster["lat"], cluster["lon"], std_km=12.0)
        
        lea_id = unit_ids[i % len(unit_ids)]
        officer_id = f"OFFICER_{np_rng.randint(100, 999)}"
        ts = (base_date + timedelta(seconds=int(np_rng.randint(0, 450*86400)))).strftime("%Y-%m-%d %H:%M:%S")
        
        gf_rows.append({
            "geofence_id": gf_id,
            "latitude": lat,
            "longitude": lon,
            "radius_km": round(float(np_rng.uniform(1.0, 15.0)), 2),
            "district": cluster["district"],
            "state": cluster["state"],
            "nearest_lea_unit_id": lea_id,
            "beat_officer_id": officer_id,
            "assignment_timestamp": ts
        })
        
    df_geofence = pd.DataFrame(gf_rows)
    save_dataset(df_geofence, RAW_DIR / "jurisdiction" / "geofence_assignments.csv", min_rows=DEFAULT_ROWS, name="Geofence Assignments")
    
    return df_units, df_geofence

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_jurisdiction(num_rows=args.rows, seed=args.seed)
