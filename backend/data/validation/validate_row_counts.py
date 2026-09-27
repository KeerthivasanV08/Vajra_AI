"""
Validate Row Counts across VAJRA Datasets.
"""

import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import RAW_DIR, MIN_ROWS, TRANSACTION_ROWS

def validate_row_counts() -> bool:
    print("[VALIDATE] Checking dataset row counts...")
    
    requirements = {
        RAW_DIR / "trustvault" / "users.csv": MIN_ROWS,
        RAW_DIR / "trustvault" / "devices.csv": MIN_ROWS,
        RAW_DIR / "transactions" / "transactions.csv": TRANSACTION_ROWS,
        RAW_DIR / "onboarding" / "onboarding_telemetry.csv": MIN_ROWS,
        RAW_DIR / "spatial" / "withdrawal_nodes_master.csv": MIN_ROWS,
        RAW_DIR / "spatial" / "ip_geo_sessions.csv": MIN_ROWS,
        RAW_DIR / "cross_border" / "cross_border_sessions.csv": MIN_ROWS,
        RAW_DIR / "complaints" / "complaints.csv": MIN_ROWS,
        RAW_DIR / "jurisdiction" / "geofence_assignments.csv": MIN_ROWS,
        RAW_DIR / "operations" / "prediction_outcomes.csv": MIN_ROWS,
        RAW_DIR / "operations" / "prediction_candidates.csv": MIN_ROWS,
        RAW_DIR / "spatial" / "corridor_hubs.csv": MIN_ROWS,
        RAW_DIR / "investigation" / "syndicate_patterns.csv": MIN_ROWS,
        RAW_DIR / "operations" / "audit_logs.csv": MIN_ROWS,
        RAW_DIR / "operations" / "legal_dossiers.csv": MIN_ROWS
    }
    
    all_passed = True
    for filepath, min_req in requirements.items():
        if not filepath.exists():
            print(f"  [FAIL] Missing file: {filepath.name}")
            all_passed = False
            continue
            
        df = pd.read_csv(filepath, usecols=[0])
        count = len(df)
        if count < min_req:
            print(f"  [FAIL] {filepath.name}: {count:,} rows < required {min_req:,}")
            all_passed = False
        else:
            print(f"  [PASS] {filepath.name}: {count:,} rows (Required >= {min_req:,})")
            
    return all_passed

if __name__ == "__main__":
    validate_row_counts()
