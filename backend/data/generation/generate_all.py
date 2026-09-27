"""
Master Generator for VAJRA Platform.
Executes all synthetic data generation scripts in strict dependency order.
"""

import sys
import argparse
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import DEFAULT_ROWS, RANDOM_SEED, TRANSACTION_ROWS
from data.generation.generate_reference import generate_reference_data
from data.generation.generate_users import generate_users
from data.generation.generate_devices import generate_devices
from data.generation.generate_transactions import generate_transactions
from data.generation.generate_onboarding_telemetry import generate_onboarding_telemetry
from data.generation.generate_withdrawal_nodes import generate_withdrawal_nodes
from data.generation.generate_ip_geo_sessions import generate_ip_geo_sessions
from data.generation.generate_cross_border_sessions import generate_cross_border_sessions
from data.generation.generate_complaints import generate_complaints
from data.generation.generate_jurisdiction import generate_jurisdiction
from data.generation.generate_corridor_hubs import generate_corridor_hubs
from data.generation.generate_prediction_outcomes import generate_prediction_outcomes
from data.generation.generate_syndicate_patterns import generate_syndicate_patterns
from data.generation.generate_audit_logs import generate_audit_logs
from data.generation.generate_legal_dossiers import generate_legal_dossiers

def run_all_generators(rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED):
    print("=" * 60)
    print(f"VAJRA SYNTHETIC DATA GENERATION PIPELINE")
    print(f"Requested Rows: {rows:,} | Random Seed: {seed}")
    print("=" * 60)
    
    # 1. Reference Data
    generate_reference_data()
    
    # 2. Users / Account Master
    df_users = generate_users(num_rows=rows, seed=seed)
    
    # 3. Device Master
    df_devices = generate_devices(df_users=df_users, num_rows=rows, seed=seed)
    
    # 4. Transactions (Needs >= 100,000 rows)
    tx_rows = max(100000, rows * 3)
    df_tx = generate_transactions(df_users=df_users, num_rows=tx_rows, seed=seed)
    
    # 5. Onboarding Telemetry
    df_onboarding = generate_onboarding_telemetry(df_users=df_users, num_rows=rows, seed=seed)
    
    # 6. Withdrawal Node Master
    df_nodes = generate_withdrawal_nodes(num_rows=rows, seed=seed)
    
    # 7. IP Geo Session Telemetry (50,000 rows target)
    ip_rows = max(50000, int(rows * 1.5))
    df_ip = generate_ip_geo_sessions(df_users=df_users, num_rows=ip_rows, seed=seed)
    
    # 8. Cross-Border Session Data
    df_cb = generate_cross_border_sessions(df_users=df_users, num_rows=rows, seed=seed)
    
    # 9. Complaint / Case Master
    df_complaints = generate_complaints(df_users=df_users, df_nodes=df_nodes, num_rows=rows, seed=seed)
    
    # 10. Jurisdiction LEA Units & Geofences
    df_units, df_geofences = generate_jurisdiction(num_rows=rows, seed=seed)
    
    # 11. Corridor Hub Events
    df_hubs = generate_corridor_hubs(num_rows=max(25000, rows), seed=seed)
    
    # 12. Prediction Ground Truth & Candidates
    df_outcomes, df_candidates = generate_prediction_outcomes(
        df_users=df_users, df_complaints=df_complaints, df_nodes=df_nodes, num_rows=rows, seed=seed
    )
    
    # 13. Syndicate Pattern Library
    df_patterns = generate_syndicate_patterns(num_rows=max(25000, rows), seed=seed)
    
    # 14. Audit Log Data
    df_audit = generate_audit_logs(num_rows=rows, seed=seed)
    
    # 15. Legal Dossier Metadata
    df_dossiers = generate_legal_dossiers(df_complaints=df_complaints, df_nodes=df_nodes, num_rows=max(25000, rows), seed=seed)
    
    print("=" * 60)
    print("ALL RAW DATASETS GENERATED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate VAJRA raw datasets.")
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS, help="Row count for primary datasets")
    parser.add_argument("--seed", type=int, default=RANDOM_SEED, help="Deterministic random seed")
    args = parser.parse_args()
    
    run_all_generators(rows=args.rows, seed=args.seed)
