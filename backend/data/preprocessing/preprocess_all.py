"""
Master Preprocessing Runner for VAJRA Platform.
Executes all preprocessing scripts in order.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.preprocessing.preprocess_users import preprocess_users
from data.preprocessing.preprocess_devices import preprocess_devices
from data.preprocessing.preprocess_transactions import preprocess_transactions
from data.preprocessing.preprocess_onboarding import preprocess_onboarding
from data.preprocessing.preprocess_withdrawal_nodes import preprocess_withdrawal_nodes
from data.preprocessing.preprocess_ip_geo import preprocess_ip_geo
from data.preprocessing.preprocess_cross_border import preprocess_cross_border
from data.preprocessing.preprocess_complaints import preprocess_complaints
from data.preprocessing.preprocess_jurisdiction import preprocess_jurisdiction
from data.preprocessing.preprocess_prediction_outcomes import preprocess_prediction_outcomes
from data.preprocessing.preprocess_operations import preprocess_operations

def run_all_preprocessors():
    print("=" * 60)
    print("VAJRA PREPROCESSING PIPELINE STARTING...")
    print("=" * 60)
    
    preprocess_users()
    preprocess_devices()
    preprocess_transactions()
    preprocess_onboarding()
    preprocess_withdrawal_nodes()
    preprocess_ip_geo()
    preprocess_cross_border()
    preprocess_complaints()
    preprocess_jurisdiction()
    preprocess_prediction_outcomes()
    preprocess_operations()
    
    print("=" * 60)
    print("ALL DATASETS PREPROCESSED & CLEANED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_preprocessors()
