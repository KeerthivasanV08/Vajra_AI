"""
Generate Raw Cross-Border Session Data.
Target File: data/raw/cross_border/cross_border_sessions.csv
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

from data.generation.config import RAW_DIR, DEFAULT_ROWS, RANDOM_SEED, COUNTRIES
from data.generation.common_utils import set_seed, save_dataset

def generate_cross_border_sessions(df_users: pd.DataFrame = None, num_rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[CROSS_BORDER] Generating {num_rows:,} cross-border session records with seed {seed}...")
    
    if df_users is not None:
        account_ids = df_users["account_id"].values
    else:
        account_ids = [f"ACC{i:06d}" for i in range(30000)]

    country_codes = [c["code"] for c in COUNTRIES]
    base_date = datetime(2025, 1, 1)

    rows = []
    for i in range(num_rows):
        cb_id = f"XBE{i:06d}"
        a_id = account_ids[i % len(account_ids)]
        
        ts_dt = base_date + timedelta(seconds=int(np_rng.randint(0, 450*86400)))
        ts_str = ts_dt.strftime("%Y-%m-%d %H:%M:%S")
        
        prev_country = np_rng.choice(country_codes, p=[0.70, 0.08, 0.05, 0.05, 0.04, 0.03, 0.03, 0.02])
        curr_country = np_rng.choice(country_codes, p=[0.40, 0.15, 0.10, 0.10, 0.08, 0.07, 0.05, 0.05])
        
        c_seq = f"{prev_country}->{curr_country}"
        
        dom_ratio_30d = round(float(np_rng.uniform(0.1, 1.0)), 4)
        vpn_ratio_30d = round(float(np_rng.beta(2, 5)), 4)
        
        days_onboard = int(np_rng.randint(5, 730))
        foreign_first_dt = ts_dt - timedelta(days=int(np_rng.randint(0, max(1, days_onboard))))
        
        f_count_7d = int(np_rng.poisson(lam=1.5))
        f_count_30d = int(f_count_7d + np_rng.poisson(lam=3.5))
        f_country_count = int(np_rng.randint(1, 5))
        f_ip_ratio = round(float(np_rng.uniform(0.05, 0.85)), 4)
        
        imminent_shift_ref = 1 if (curr_country != "IN" and vpn_ratio_30d > 0.4 and f_count_7d > 3) else 0
        card_block_ref = 1 if (imminent_shift_ref and np_rng.rand() < 0.60) else 0
        
        rows.append({
            "cross_border_event_id": cb_id,
            "account_id": a_id,
            "session_timestamp": ts_str,
            "previous_country": prev_country,
            "current_country": curr_country,
            "country_sequence": c_seq,
            "domestic_session_ratio_30d": dom_ratio_30d,
            "vpn_usage_ratio_30d": vpn_ratio_30d,
            "foreign_ip_first_seen_at": foreign_first_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "days_since_onboarding": days_onboard,
            "foreign_session_count_7d": f_count_7d,
            "foreign_session_count_30d": f_count_30d,
            "foreign_country_count": f_country_count,
            "foreign_ip_ratio": f_ip_ratio,
            "imminent_overseas_shift_reference": imminent_shift_ref,
            "flagged_for_card_block_reference": card_block_ref
        })

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "cross_border" / "cross_border_sessions.csv", min_rows=DEFAULT_ROWS, name="Cross-Border Sessions Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_cross_border_sessions(num_rows=args.rows, seed=args.seed)
