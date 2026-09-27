"""
Candidate Generation Stage — NON-ML Stage.
Generates shortlist of top 20 candidate withdrawal nodes per prediction using spatial nearest neighbor search.
Output: data/processed/node_ranking_candidates.csv
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import PROCESSED_DIR
from backend.ml.common_ml import haversine_distance
from data.preprocessing.common_preprocessing import save_clean_csv

def build_candidate_dataset(top_k_candidates: int = 20) -> pd.DataFrame:
    print(f"[CANDIDATES] Generating non-ML candidate shortlist (top {top_k_candidates} candidate nodes per prediction)...")
    
    pred_path = PROCESSED_DIR / "operations" / "prediction_outcomes_clean.csv"
    nodes_path = PROCESSED_DIR / "spatial" / "withdrawal_nodes_clean.csv"
    users_path = PROCESSED_DIR / "onboarding" / "users_clean.csv"
    
    df_pred = pd.read_csv(pred_path)
    df_nodes = pd.read_csv(nodes_path)
    df_users = pd.read_csv(users_path) if users_path.exists() else pd.DataFrame()
    
    user_dict = df_users.set_index("account_id").to_dict("index") if not df_users.empty else {}
    node_lats = df_nodes["latitude"].values
    node_lons = df_nodes["longitude"].values
    node_ids = df_nodes["node_id"].values
    node_types = df_nodes["node_type"].values
    node_regions = df_nodes["state"].values
    node_vuln = df_nodes["vulnerability_score_reference"].values
    
    # Pre-calculate historical fraud density reference per node
    node_fraud_dens = (df_nodes["historical_fraud_cashouts"].values * 1.5).astype(int)
    node_cashout_rate = (df_nodes["historical_cash_withdrawals"].values / df_nodes["historical_txn_volume"].clip(lower=1).values).round(4)

    rows = []
    np_rng = np.random.RandomState(42)

    for idx, p_row in df_pred.iterrows():
        p_id = p_row["prediction_id"]
        a_id = p_row["account_id"]
        pred_lat = p_row["predicted_lat_reference"]
        pred_lon = p_row["predicted_lon_reference"]
        actual_node = p_row["actual_withdrawal_node_id"]
        
        # Calculate Haversine distance from predicted point to all nodes
        distances = haversine_distance(pred_lat, pred_lon, node_lats, node_lons)
        
        # Get indices of top K closest nodes
        closest_indices = np.argsort(distances)[:top_k_candidates]
        
        # Ensure actual node is in the shortlist for ground truth evaluation if missing
        if actual_node in node_ids:
            act_idx = np.where(node_ids == actual_node)[0][0]
            if act_idx not in closest_indices:
                closest_indices[-1] = act_idx # Replace farthest candidate with actual node
                
        u_info = user_dict.get(a_id, {})
        digital_risk = float(u_info.get("domestic_session_ratio", 0.85))
        mule_prob = float(0.85 if u_info.get("synthetic_profile_type") in ["POTENTIAL_MULE", "MULE_LIKE"] else 0.05)
        traj_conf = round(float(np_rng.uniform(0.60, 0.95)), 4)
        
        for n_idx in closest_indices:
            c_node_id = node_ids[n_idx]
            dist_km = round(float(distances[n_idx]), 2)
            c_type = node_types[n_idx]
            c_region = node_regions[n_idx]
            c_vuln = float(node_vuln[n_idx])
            c_fraud_dens = int(node_fraud_dens[n_idx])
            c_cashout_rate = float(node_cashout_rate[n_idx])
            
            is_actual = 1 if c_node_id == actual_node else 0
            
            rows.append({
                "prediction_id": p_id,
                "account_id": a_id,
                "predicted_h3_cell": f"CELL_{(n_idx % 50) + 1:03d}",
                "candidate_node_id": c_node_id,
                "candidate_distance_km": dist_km,
                "candidate_region": c_region,
                "candidate_node_type": c_type,
                "node_vulnerability_score": c_vuln,
                "fraud_density_5km": c_fraud_dens,
                "historical_cashout_rate": c_cashout_rate,
                "trajectory_confidence": traj_conf,
                "digital_risk_score": digital_risk,
                "mule_probability": mule_prob,
                "time_of_day": int(np_rng.randint(0, 24)),
                "day_of_week": int(np_rng.randint(0, 7)),
                "is_actual_cashout_node": is_actual
            })

    df_cand = pd.DataFrame(rows)
    out_path = PROCESSED_DIR / "node_ranking_candidates.csv"
    return save_clean_csv(df_cand, out_path, name="Node Ranking Candidates Shortlist")

if __name__ == "__main__":
    build_candidate_dataset()
