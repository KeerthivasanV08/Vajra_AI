"""
Generate Raw Corridor Hub Events Dataset.
Target File: data/raw/spatial/corridor_hubs.csv
Minimum Rows: 25,000
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

from data.generation.config import RAW_DIR, DEFAULT_ROWS, RANDOM_SEED, CORRIDORS
from data.generation.common_utils import set_seed, save_dataset

def generate_corridor_hubs(num_rows: int = 25000, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[CORRIDORS] Generating {num_rows:,} corridor hub event records with seed {seed}...")
    
    corridor_ids = [c["id"] for c in CORRIDORS]
    base_date = datetime(2025, 1, 1)

    rows = []
    for i in range(num_rows):
        evt_id = f"HBE{i:06d}"
        corr_id = corridor_ids[i % len(corridor_ids)]
        
        ts = (base_date + timedelta(seconds=int(np_rng.randint(0, 450*86400)))).strftime("%Y-%m-%d %H:%M:%S")
        
        active_mules = int(np_rng.poisson(lam=8.0) + 1)
        complaints = int(np_rng.poisson(lam=12.0))
        intensity = round(float(min(1.0, 0.2 + (active_mules * 0.04) + (complaints * 0.03))), 4)
        cashout_act = np_rng.choice(["LOW", "MODERATE", "ELEVATED", "CRITICAL"], p=[0.30, 0.40, 0.20, 0.10])
        
        rows.append({
            "hub_event_id": evt_id,
            "corridor_id": corr_id,
            "timestamp": ts,
            "active_mule_count_reference": active_mules,
            "complaint_count_reference": complaints,
            "intensity_score_reference": intensity,
            "cashout_activity_reference": cashout_act
        })

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "spatial" / "corridor_hubs.csv", min_rows=25000, name="Corridor Hub Events")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=25000)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_corridor_hubs(num_rows=args.rows, seed=args.seed)
