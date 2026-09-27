"""
Generate Raw Syndicate Pattern Library Observation Dataset.
Target File: data/raw/investigation/syndicate_patterns.csv
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

from data.generation.config import RAW_DIR, DEFAULT_ROWS, RANDOM_SEED, SYNDICATE_PATTERNS, CORRIDORS
from data.generation.common_utils import set_seed, save_dataset

def generate_syndicate_patterns(num_rows: int = 25000, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[SYNDICATE] Generating {num_rows:,} syndicate pattern observation records with seed {seed}...")
    
    base_date = datetime(2025, 1, 1)
    corridor_ids = [c["id"] for c in CORRIDORS]

    rows = []
    for i in range(num_rows):
        obs_id = f"PAT_OBS_{i:06d}"
        p_type = SYNDICATE_PATTERNS[i % len(SYNDICATE_PATTERNS)]
        p_id = f"PAT_RULE_{SYNDICATE_PATTERNS.index(p_type) + 1:02d}"
        
        ts = (base_date + timedelta(seconds=int(np_rng.randint(0, 450*86400)))).strftime("%Y-%m-%d %H:%M:%S")
        
        hop_count = int(np_rng.randint(2, 8))
        fan_out = round(float(np_rng.uniform(1.5, 12.0)), 2)
        layering_time = round(float(np_rng.exponential(scale=45.0) + 2.0), 2)
        velocity = round(float(layering_time / max(1, hop_count)), 2)
        
        term_risk = round(float(np_rng.beta(7, 3)), 4)
        corr_id = corridor_ids[i % len(corridor_ids)]
        rule_sig = f"RULE_SIG_{p_type}_{hop_count}H_{int(fan_out)}F"
        conf_ref = round(float(np_rng.beta(8, 2)), 4)
        
        rows.append({
            "pattern_observation_id": obs_id,
            "pattern_id": p_id,
            "pattern_name": p_type.replace("_", " ").title(),
            "pattern_type": p_type,
            "hop_count": hop_count,
            "fan_out_factor": fan_out,
            "layering_time_mins": layering_time,
            "average_interhop_velocity_mins": velocity,
            "terminal_node_risk_reference": term_risk,
            "associated_corridor_id": corr_id,
            "matching_rule_signature": rule_sig,
            "match_confidence_reference": conf_ref,
            "timestamp": ts,
            "is_synthetic": 1
        })

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "investigation" / "syndicate_patterns.csv", min_rows=25000, name="Syndicate Patterns Observation Library")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=25000)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_syndicate_patterns(num_rows=args.rows, seed=args.seed)
