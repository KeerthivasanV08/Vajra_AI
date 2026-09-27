"""
Validate Numeric Ranges and Domain Constraints across VAJRA Datasets.
"""

import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import RAW_DIR, PROCESSED_DIR

def validate_ranges() -> bool:
    print("[VALIDATE] Checking numeric ranges and boundary conditions...")
    
    all_passed = True
    
    # 1. Transactions amount check
    tx_path = PROCESSED_DIR / "transactions" / "transactions_clean.csv"
    if tx_path.exists():
        df_tx = pd.read_csv(tx_path)
        if (df_tx["amount"] < 0).any():
            print("  [FAIL] Negative transaction amounts detected!")
            all_passed = False
        else:
            print("  [PASS] All transaction amounts are non-negative")

    # 2. Node coordinates & vulnerability range check
    node_path = PROCESSED_DIR / "spatial" / "withdrawal_nodes_clean.csv"
    if node_path.exists():
        df_n = pd.read_csv(node_path)
        bad_lat = ((df_n["latitude"] < -90) | (df_n["latitude"] > 90)).any()
        bad_lon = ((df_n["longitude"] < -180) | (df_n["longitude"] > 180)).any()
        bad_vuln = ((df_n["vulnerability_score_reference"] < 0) | (df_n["vulnerability_score_reference"] > 1)).any()
        if bad_lat or bad_lon or bad_vuln:
            print("  [FAIL] Node coordinates or vulnerability scores out of range!")
            all_passed = False
        else:
            print("  [PASS] Node coordinates and vulnerability scores within valid bounds")

    # 3. IP Geo Session coordinates check
    ip_path = PROCESSED_DIR / "spatial" / "ip_geo_sessions_clean.csv"
    if ip_path.exists():
        df_ip = pd.read_csv(ip_path)
        bad_lat = ((df_ip["geo_lat"] < -90) | (df_ip["geo_lat"] > 90)).any()
        bad_lon = ((df_ip["geo_lon"] < -180) | (df_ip["geo_lon"] > 180)).any()
        if bad_lat or bad_lon:
            print("  [FAIL] IP Geo Session coordinates out of range!")
            all_passed = False
        else:
            print("  [PASS] IP Geo Session coordinates within valid bounds")

    # 4. Onboarding score bounds check
    onb_path = PROCESSED_DIR / "onboarding" / "onboarding_clean.csv"
    if onb_path.exists():
        df_o = pd.read_csv(onb_path)
        scores = ["face_match_score", "identity_trust_score", "device_trust_score", "ip_risk_score"]
        bad_scores = any(((df_o[c] < 0) | (df_o[c] > 1)).any() for c in scores if c in df_o.columns)
        if bad_scores:
            print("  [FAIL] Onboarding scores out of [0, 1] range!")
            all_passed = False
        else:
            print("  [PASS] Onboarding scores within valid [0, 1] range")

    return all_passed

if __name__ == "__main__":
    validate_ranges()
