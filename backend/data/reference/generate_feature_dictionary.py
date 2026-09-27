"""
Generate Feature Dictionary Reference File.
Target File: data/reference/feature_dictionary.csv
"""

import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import REFERENCE_DIR

def generate_feature_dictionary():
    print("[REFERENCE] Creating feature dictionary reference CSV...")
    
    features = [
        {"feature_name": "account_age_days", "dataset": "users_clean", "data_type": "int", "description": "Days since account creation", "formula": "current_date - created_at", "source": "Core Banking", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "device_age_days", "dataset": "devices_clean", "data_type": "int", "description": "Days since device first seen", "formula": "current_date - first_seen_at", "source": "Device Fingerprint", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "domestic_session_ratio", "dataset": "users_clean", "data_type": "float", "description": "Ratio of domestic sessions in last 30d", "formula": "domestic_sessions / total_sessions", "source": "IP Sessions", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "txn_velocity_1h", "dataset": "user_velocity", "data_type": "int", "description": "Count of transactions in trailing 1 hour", "formula": "COUNT(tx) in [t-1h, t]", "source": "Transactions Ledger", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "drain_ratio", "dataset": "user_velocity", "data_type": "float", "description": "Ratio of transferred amount to balance", "formula": "outgoing_sum / (sender_balance_before + 1e-5)", "source": "Transactions Ledger", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "forwarding_delay_mins", "dataset": "user_velocity", "data_type": "float", "description": "Minutes between inbound credit & outbound debit", "formula": "outbound_ts - inbound_ts", "source": "Transactions Ledger", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "amount_zscore", "dataset": "transaction_features", "data_type": "float", "description": "Historical z-score of transaction amount", "formula": "(amount - mean) / std", "source": "Transactions Ledger", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "distance_to_corridor", "dataset": "node_features", "data_type": "float", "description": "Haversine distance to nearest corridor hub", "formula": "Haversine(node_lat, node_lon, hub_lat, hub_lon)", "source": "GIS Reference", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "fraud_density_5km", "dataset": "node_features", "data_type": "int", "description": "Count of historical fraud cases within 5km radius", "formula": "COUNT(complaints within 5km before t)", "source": "NCRP Complaints", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "vpn_usage_ratio_30d", "dataset": "cross_border_sessions", "data_type": "float", "description": "VPN sessions / total sessions trailing 30d", "formula": "vpn_sessions_30d / total_sessions_30d", "source": "IP Sessions", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "digital_risk_score", "dataset": "users_clean", "data_type": "float", "description": "Upstream digital AML risk score", "formula": "Digital AML Risk Score", "source": "Digital AML Risk Engine", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "predicted_h3_cell", "dataset": "spatial_trajectory", "data_type": "string", "description": "Predicted spatial H3 grid cell", "formula": "Model 1 Sequence Prediction", "source": "Model 1 Trajectory", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "node_vulnerability_score", "dataset": "withdrawal_nodes_clean", "data_type": "float", "description": "Estimated cash-out node vulnerability", "formula": "Model 2 Vulnerability Estimator", "source": "Model 2 Node Engine", "is_model_input": True, "is_target": False, "leakage_risk": "Low", "available_at_prediction_time": True},
        {"feature_name": "is_actual_cashout_node", "dataset": "vajra_ground_truth", "data_type": "int", "description": "Future ground truth label (1 if cashout occurred)", "formula": "Node Match Ground Truth", "source": "Operations Ground Truth", "is_model_input": False, "is_target": True, "leakage_risk": "High (Target Only)", "available_at_prediction_time": False}
    ]

    df = pd.DataFrame(features)
    out_path = REFERENCE_DIR / "feature_dictionary.csv"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"[REFERENCE] Created feature dictionary -> {out_path}")

if __name__ == "__main__":
    generate_feature_dictionary()
