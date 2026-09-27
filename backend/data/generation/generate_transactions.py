"""
Generate Raw Transactions Dataset.
Target File: data/raw/transactions/transactions.csv
Minimum Rows: 100,000
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
    RAW_DIR, TRANSACTION_ROWS, RANDOM_SEED, HOTSPOT_CLUSTERS,
    TRANSACTION_TYPES, CHANNELS, PAYMENT_MODES
)
from data.generation.common_utils import set_seed, save_dataset, generate_synthetic_ip, add_geo_jitter

def generate_transactions(df_users: pd.DataFrame = None, num_rows: int = TRANSACTION_ROWS, seed: int = RANDOM_SEED) -> pd.DataFrame:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[TRANSACTIONS] Generating {num_rows:,} transaction records with seed {seed}...")
    
    if df_users is not None and "account_id" in df_users.columns:
        accounts = df_users["account_id"].values
        devices = df_users["device_id"].values
        cities = df_users["city"].values
        states = df_users["state"].values
        acct_to_dev = dict(zip(accounts, devices))
        acct_to_city = dict(zip(accounts, cities))
        acct_to_state = dict(zip(accounts, states))
    else:
        accounts = [f"ACC{i:06d}" for i in range(30000)]
        devices = [f"DEV{i:06d}" for i in range(30000)]
        acct_to_dev = dict(zip(accounts, devices))
        cluster_list = [c["city"] for c in HOTSPOT_CLUSTERS]
        state_list = [c["state"] for c in HOTSPOT_CLUSTERS]
        acct_to_city = {a: np_rng.choice(cluster_list) for a in accounts}
        acct_to_state = {a: np_rng.choice(state_list) for a in accounts}

    base_start = datetime(2025, 1, 1)
    base_end = datetime(2026, 8, 31)
    total_seconds = int((base_end - base_start).total_seconds())

    # Create account initial balances
    account_balances = {acc: float(np_rng.uniform(5000, 500000)) for acc in accounts}

    rows = []
    
    # Pre-generate timestamps for temporal ordering
    random_offsets = np_rng.randint(0, total_seconds, size=num_rows)
    random_offsets.sort()
    
    city_coords = {c["city"]: (c["lat"], c["lon"]) for c in HOTSPOT_CLUSTERS}

    for i in range(num_rows):
        tx_id = f"TXN{i:08d}"
        trans_id = f"T{i}"
        
        ts_dt = base_start + timedelta(seconds=int(random_offsets[i]))
        ts_str = ts_dt.strftime("%Y-%m-%d %H:%M:%S+00:00")
        
        # Pick sender & receiver
        s_acc = np_rng.choice(accounts)
        r_acc = np_rng.choice(accounts)
        while r_acc == s_acc:
            r_acc = np_rng.choice(accounts)
            
        s_dev = acct_to_dev.get(s_acc, "DEV_000000")
        r_dev = acct_to_dev.get(r_acc, "DEV_000001")
        
        s_city = acct_to_city.get(s_acc, "Delhi")
        r_city = acct_to_city.get(r_acc, "Mumbai")
        s_state = acct_to_state.get(s_acc, "Delhi")
        r_state = acct_to_state.get(r_acc, "Maharashtra")
        
        s_base_lat, s_base_lon = city_coords.get(s_city, (28.6139, 77.2090))
        r_base_lat, r_base_lon = city_coords.get(r_city, (19.0760, 72.8777))
        
        s_lat, s_lon = add_geo_jitter(s_base_lat, s_base_lon, std_km=3.0)
        r_lat, r_lon = add_geo_jitter(r_base_lat, r_base_lon, std_km=3.0)
        
        tx_type = np_rng.choice(TRANSACTION_TYPES, p=[0.20, 0.20, 0.45, 0.02, 0.10, 0.03])
        channel = np_rng.choice(CHANNELS, p=[0.10, 0.50, 0.15, 0.05, 0.02, 0.05, 0.05, 0.04, 0.02, 0.02])
        mode = np_rng.choice(PAYMENT_MODES, p=[0.45, 0.20, 0.10, 0.05, 0.10, 0.05, 0.03, 0.02])
        
        amount = round(float(np_rng.exponential(scale=4500) + 10), 2)
        if tx_type in ["CASH_WITHDRAWAL", "CASH_DEPOSIT"]:
            amount = float(np_rng.choice([500, 1000, 2000, 5000, 10000, 20000, 50000]))
            
        s_bal_before = account_balances.get(s_acc, 50000.0)
        s_bal_after = max(0.0, s_bal_before - amount)
        account_balances[s_acc] = s_bal_after
        
        r_bal_before = account_balances.get(r_acc, 20000.0)
        r_bal_after = r_bal_before + amount
        account_balances[r_acc] = r_bal_after
        
        time_to_pay = int(np_rng.randint(500, 60000))
        is_cash = 1 if tx_type in ["CASH_WITHDRAWAL", "CASH_DEPOSIT"] or channel in ["ATM", "MICRO_ATM", "CSP"] else 0
        
        rows.append({
            "transaction_id": tx_id,
            "trans_id": trans_id,
            "timestamp": ts_str,
            "sender_account_id": s_acc,
            "receiver_account_id": r_acc,
            "amount": amount,
            "currency": "INR",
            "transaction_type": tx_type,
            "channel": channel,
            "payment_mode": mode,
            "sender_device_id": s_dev,
            "receiver_device_id": r_dev,
            "sender_ip": generate_synthetic_ip(np_rng),
            "receiver_ip": generate_synthetic_ip(np_rng),
            "sender_lat": s_lat,
            "sender_lon": s_lon,
            "receiver_lat": r_lat,
            "receiver_lon": r_lon,
            "sender_city": s_city,
            "receiver_city": r_city,
            "sender_state": s_state,
            "receiver_state": r_state,
            "sender_balance_before": round(s_bal_before, 2),
            "sender_balance_after": round(s_bal_after, 2),
            "receiver_balance_before": round(r_bal_before, 2),
            "receiver_balance_after": round(r_bal_after, 2),
            "time_to_pay_ms": time_to_pay,
            "transaction_status": np_rng.choice(["SUCCESS", "FAILED", "PENDING"], p=[0.94, 0.05, 0.01]),
            "is_reversal": 1 if np_rng.rand() < 0.01 else 0,
            "is_cash_related": is_cash,
            "is_synthetic": 1
        })
        
    df = pd.DataFrame(rows)
    save_dataset(df, RAW_DIR / "transactions" / "transactions.csv", min_rows=TRANSACTION_ROWS, name="Transactions Master")
    return df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=TRANSACTION_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_transactions(num_rows=args.rows, seed=args.seed)
