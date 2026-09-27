"""
Master Feature Builder Runner for VAJRA Platform.
Executes all feature engineering scripts in order.
"""

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.features.build_user_features import build_user_features
from data.features.build_transaction_features import build_transaction_features
from data.features.build_velocity_features import build_velocity_features
from data.features.build_onboarding_features import build_onboarding_features
from data.features.build_geo_trajectory_features import build_geo_trajectory_features
from data.features.build_node_features import build_node_features
from data.features.build_cashout_features import build_cashout_features
from data.features.build_cross_border_features import build_cross_border_features
from data.features.build_complaint_features import build_complaint_features
from data.features.build_jurisdiction_features import build_jurisdiction_features
from data.features.build_integrated_features import build_integrated_features

def run_all_feature_builders():
    print("=" * 60)
    print("VAJRA FEATURE ENGINEERING PIPELINE STARTING...")
    print("=" * 60)
    
    build_user_features()
    build_transaction_features()
    build_velocity_features()
    build_onboarding_features()
    build_geo_trajectory_features()
    build_node_features()
    build_cashout_features()
    build_cross_border_features()
    build_complaint_features()
    build_jurisdiction_features()
    build_integrated_features()
    
    print("=" * 60)
    print("ALL FEATURE DATASETS BUILT SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_all_feature_builders()
