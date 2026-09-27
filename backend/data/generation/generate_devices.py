"""
Generate Raw Devices Master Dataset.
Target File: data/raw/trustvault/devices.csv
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

def generate_devices(df_users: pd.DataFrame = None, num_rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[DEVICES] Generating {num_rows:,} device records with seed {seed}...")
    
    if df_users is not None and "device_id" in df_users.columns:
        user_devices = df_users["device_id"].unique().tolist()
        num_rows = max(num_rows, len(user_devices))
        device_ids = user_devices + [f"DEV{i:06d}" for i in range(len(user_devices), num_rows)]
    else:
        device_ids = [f"DEV{i:06d}" for i in range(num_rows)]

    manufacturers = ["Samsung", "Xiaomi", "Vivo", "Oppo", "Realme", "OnePlus", "Apple", "Google", "Motorola", "Tecno"]
    os_types = ["ANDROID", "IOS"]
    resolutions = ["1080x2400", "720x1600", "1170x2532", "1440x3200", "1080x2340"]
    device_types = ["MOBILE", "TABLET", "DESKTOP"]
    risk_groups = ["LOW_RISK", "MODERATE_RISK", "SHARED_CLONED", "EMULATOR_FARM", "HIGH_RISK_ROOTED"]

    base_date = datetime(2025, 6, 1)

    rows = []
    for i in range(num_rows):
        dev_id = device_ids[i]
        mfg = str(np_rng.choice(manufacturers, p=[0.25, 0.20, 0.15, 0.12, 0.10, 0.08, 0.05, 0.02, 0.02, 0.01]))
        os_t = "IOS" if mfg == "Apple" else "ANDROID"
        os_ver = str(np_rng.choice([14, 15, 16, 17]) if os_t == "IOS" else np_rng.choice([11, 12, 13, 14, 15]))
        
        dev_age = int(np_rng.randint(10, 1200))
        risk_grp = str(np_rng.choice(risk_groups, p=[0.70, 0.15, 0.08, 0.04, 0.03]))
        
        is_emulator = 1 if risk_grp == "EMULATOR_FARM" else (1 if np_rng.rand() < 0.02 else 0)
        is_rooted = 1 if risk_grp in ["HIGH_RISK_ROOTED", "EMULATOR_FARM"] else (1 if np_rng.rand() < 0.03 else 0)
        is_cloned = 1 if risk_grp == "SHARED_CLONED" else (1 if np_rng.rand() < 0.04 else 0)
        
        shared_count = int(np_rng.randint(3, 12)) if risk_grp in ["SHARED_CLONED", "EMULATOR_FARM"] else int(np_rng.choice([1, 2], p=[0.90, 0.10]))
        shared_flag = 1 if shared_count > 1 else 0
        
        hw_hash = hashlib.sha256(f"{dev_id}_{mfg}_{os_ver}_{i}".encode()).hexdigest()[:16]
        
        first_dt = base_date - timedelta(days=dev_age)
        last_dt = first_dt + timedelta(days=int(np_rng.randint(0, dev_age)))
        
        rows.append({
            "device_id": dev_id,
            "device_type": np_rng.choice(device_types, p=[0.92, 0.05, 0.03]),
            "os_type": os_t,
            "os_version": os_ver,
            "device_age_days": dev_age,
            "manufacturer": mfg,
            "model_family": f"{mfg} Series-{np_rng.randint(1, 10)}",
            "root_status": is_rooted,
            "emulator_flag": is_emulator,
            "app_cloner_flag": is_cloned,
            "shared_device_flag": shared_flag,
            "shared_user_count": shared_count,
            "screen_resolution": np_rng.choice(resolutions),
            "hardware_hash": hw_hash,
            "first_seen_at": first_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "last_seen_at": last_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "device_country": "India" if np_rng.rand() < 0.96 else np_rng.choice(["UAE", "Thailand", "Singapore", "US"]),
            "synthetic_device_risk_group": risk_grp
        })

    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "trustvault" / "devices.csv", min_rows=DEFAULT_ROWS, name="Devices Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_devices(num_rows=args.rows, seed=args.seed)
