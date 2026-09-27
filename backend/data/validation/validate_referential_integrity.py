"""
Validate Referential Integrity and Foreign Keys across VAJRA Datasets.
"""

import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import RAW_DIR

def validate_referential_integrity() -> bool:
    print("[VALIDATE] Checking referential integrity...")
    
    users_path = RAW_DIR / "trustvault" / "users.csv"
    nodes_path = RAW_DIR / "spatial" / "withdrawal_nodes_master.csv"
    tx_path = RAW_DIR / "transactions" / "transactions.csv"
    cmp_path = RAW_DIR / "complaints" / "complaints.csv"
    pred_path = RAW_DIR / "operations" / "prediction_outcomes.csv"
    units_path = RAW_DIR / "jurisdiction" / "jurisdiction_units.csv"
    geo_path = RAW_DIR / "jurisdiction" / "geofence_assignments.csv"

    if not users_path.exists():
        print("  [FAIL] Users dataset missing!")
        return False
        
    df_u = pd.read_csv(users_path, usecols=["account_id", "user_id", "device_id"])
    valid_accounts = set(df_u["account_id"].dropna().unique())
    valid_users = set(df_u["user_id"].dropna().unique())
    
    valid_nodes = set()
    if nodes_path.exists():
        df_n = pd.read_csv(nodes_path, usecols=["node_id"])
        valid_nodes = set(df_n["node_id"].dropna().unique())
        
    valid_units = set()
    if units_path.exists():
        df_lea = pd.read_csv(units_path, usecols=["nearest_lea_unit_id"])
        valid_units = set(df_lea["nearest_lea_unit_id"].dropna().unique())

    all_passed = True

    # 1. Transactions sender & receiver accounts
    if tx_path.exists():
        df_tx = pd.read_csv(tx_path, usecols=["sender_account_id", "receiver_account_id"])
        invalid_senders = set(df_tx["sender_account_id"].unique()) - valid_accounts
        invalid_receivers = set(df_tx["receiver_account_id"].unique()) - valid_accounts
        if invalid_senders or invalid_receivers:
            print(f"  [FAIL] Transactions contains orphaned accounts: {len(invalid_senders)} senders, {len(invalid_receivers)} receivers")
            all_passed = False
        else:
            print(f"  [PASS] Transactions accounts resolved against Users Master")

    # 2. Complaints victim accounts & linked accounts
    if cmp_path.exists():
        df_c = pd.read_csv(cmp_path, usecols=["victim_account_id", "linked_account_id"])
        invalid_victims = set(df_c["victim_account_id"].unique()) - valid_accounts
        invalid_linked = set(df_c["linked_account_id"].unique()) - valid_accounts
        if invalid_victims or invalid_linked:
            print(f"  [FAIL] Complaints contains orphaned accounts")
            all_passed = False
        else:
            print(f"  [PASS] Complaints accounts resolved against Users Master")

    # 3. Prediction outcomes accounts & actual nodes
    if pred_path.exists():
        df_p = pd.read_csv(pred_path, usecols=["account_id", "actual_withdrawal_node_id"])
        invalid_p_acc = set(df_p["account_id"].unique()) - valid_accounts
        invalid_p_node = set(df_p["actual_withdrawal_node_id"].unique()) - valid_nodes
        if invalid_p_acc or invalid_p_node:
            print(f"  [FAIL] Prediction outcomes contains orphaned accounts or nodes")
            all_passed = False
        else:
            print(f"  [PASS] Prediction outcomes resolved against Users and Nodes Master")

    # 4. Geofence assignments LEA units
    if geo_path.exists():
        df_g = pd.read_csv(geo_path, usecols=["nearest_lea_unit_id"])
        invalid_units = set(df_g["nearest_lea_unit_id"].unique()) - valid_units
        if invalid_units:
            print(f"  [FAIL] Geofences contains invalid LEA unit references")
            all_passed = False
        else:
            print(f"  [PASS] Geofence LEA unit references resolved")

    return all_passed

if __name__ == "__main__":
    validate_referential_integrity()
