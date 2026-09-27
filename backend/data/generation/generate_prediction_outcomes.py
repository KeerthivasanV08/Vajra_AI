"""
Generate Raw Prediction Outcomes and Prediction Candidates Ground-Truth Datasets.
Target Files:
- data/raw/operations/prediction_outcomes.csv (Minimum 30,000 rows)
- data/raw/operations/prediction_candidates.csv (Minimum 30,000 rows)
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

from data.generation.config import RAW_DIR, DEFAULT_ROWS, RANDOM_SEED, HOTSPOT_CLUSTERS, CORRIDORS, NODE_TYPES
from data.generation.common_utils import set_seed, save_dataset, add_geo_jitter

def generate_prediction_outcomes(df_users: pd.DataFrame = None, df_complaints: pd.DataFrame = None, df_nodes: pd.DataFrame = None, num_rows: int = DEFAULT_ROWS, seed: int = RANDOM_SEED) -> tuple:
    fake = set_seed(seed)
    np_rng = np.random.RandomState(seed)
    
    print(f"[PREDICTION_OUTCOMES] Generating {num_rows:,} prediction scenarios with seed {seed}...")
    
    accounts = df_users["account_id"].values if df_users is not None else [f"ACC{i:06d}" for i in range(30000)]
    complaints = df_complaints["complaint_id"].values if df_complaints is not None else [f"CMP{i:06d}" for i in range(30000)]
    node_ids = df_nodes["node_id"].values if df_nodes is not None else [f"NODE{i:06d}" for i in range(30000)]
    
    base_date = datetime(2025, 1, 1)

    outcomes_rows = []
    candidates_rows = []
    
    for i in range(num_rows):
        pred_id = f"PRED{i:06d}"
        a_id = accounts[i % len(accounts)]
        c_id = complaints[i % len(complaints)]
        
        scen_dt = base_date + timedelta(seconds=int(np_rng.randint(0, 450*86400)))
        
        cluster = HOTSPOT_CLUSTERS[i % len(HOTSPOT_CLUSTERS)]
        pred_lat, pred_lon = add_geo_jitter(cluster["lat"], cluster["lon"], std_km=3.0)
        actual_lat, actual_lon = add_geo_jitter(pred_lat, pred_lon, std_km=1.5)
        
        actual_node = node_ids[i % len(node_ids)]
        time_to_cashout = int(np_rng.randint(5, 120))
        act_ts = (scen_dt + timedelta(minutes=time_to_cashout)).strftime("%Y-%m-%d %H:%M:%S")
        
        corr_info = CORRIDORS[i % len(CORRIDORS)]
        corr_id = corr_info["id"]
        
        dlat = (actual_lat - corr_info["lat"]) * 111.0
        dlon = (actual_lon - corr_info["lon"]) * 111.0 * np.cos(np.radians(actual_lat))
        dist_corr_km = round(float(np.sqrt(dlat**2 + dlon**2)), 2)
        
        cand_rank = 1
        cand_ref_prob = round(float(np_rng.beta(8, 2)), 4)
        is_correct_ref = 1 if np_rng.rand() < 0.78 else 0
        
        time_to_interv = int(np_rng.randint(10, 180))
        outcome = np_rng.choice(["INTERCEPTED_AT_ATM", "FREEZE_EXECUTED", "COMPLETED_CASHOUT", "INTERVENTION_MISSED"], p=[0.45, 0.25, 0.20, 0.10])
        
        outcomes_rows.append({
            "prediction_id": pred_id,
            "account_id": a_id,
            "complaint_id": c_id,
            "scenario_timestamp": scen_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "predicted_lat_reference": pred_lat,
            "predicted_lon_reference": pred_lon,
            "actual_withdrawal_lat": actual_lat,
            "actual_withdrawal_lon": actual_lon,
            "actual_withdrawal_node_id": actual_node,
            "actual_withdrawal_timestamp": act_ts,
            "time_to_cashout_mins": time_to_cashout,
            "corridor_id": corr_id,
            "distance_from_corridor_km": dist_corr_km,
            "candidate_rank": cand_rank,
            "candidate_node_id": actual_node if is_correct_ref else node_ids[(i + 1) % len(node_ids)],
            "candidate_reference_probability": cand_ref_prob,
            "prediction_correct_reference": is_correct_ref,
            "time_to_intervention_mins": time_to_interv,
            "intervention_outcome": outcome,
            "is_synthetic": 1
        })
        
        # Generate Top-3 Candidates for each prediction
        for rank in range(1, 4):
            c_node = actual_node if (rank == 1 and is_correct_ref) else node_ids[(i + rank*10) % len(node_ids)]
            c_lat, c_lon = add_geo_jitter(pred_lat, pred_lon, std_km=float(rank * 2.0))
            n_type = np_rng.choice(NODE_TYPES)
            c_score = round(float(max(0.1, cand_ref_prob - (rank - 1) * 0.25)), 4)
            
            w_start = (scen_dt + timedelta(minutes=int(np_rng.randint(0, 15)))).strftime("%Y-%m-%d %H:%M:%S")
            w_end = (scen_dt + timedelta(minutes=int(np_rng.randint(30, 120)))).strftime("%Y-%m-%d %H:%M:%S")
            match_flag = 1 if c_node == actual_node else 0
            
            candidates_rows.append({
                "prediction_id": pred_id,
                "account_id": a_id,
                "candidate_rank": rank,
                "candidate_node_id": c_node,
                "candidate_lat": c_lat,
                "candidate_lon": c_lon,
                "candidate_node_type": n_type,
                "distance_from_projected_corridor_km": round(float(dist_corr_km + rank), 2),
                "candidate_reference_score": c_score,
                "predicted_window_start": w_start,
                "predicted_window_end": w_end,
                "actual_node_match": match_flag,
                "is_synthetic": 1
            })

    df_outcomes = pd.DataFrame(outcomes_rows)
    save_dataset(df_outcomes, RAW_DIR / "operations" / "prediction_outcomes.csv", min_rows=DEFAULT_ROWS, name="Prediction Outcomes Ground-Truth")
    
    df_candidates = pd.DataFrame(candidates_rows)
    save_dataset(df_candidates, RAW_DIR / "operations" / "prediction_candidates.csv", min_rows=DEFAULT_ROWS, name="Prediction Candidates Top-K")

    return df_outcomes, df_candidates

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--rows", type=int, default=DEFAULT_ROWS)
    parser.add_argument("--seed", type=int, default=RANDOM_SEED)
    args = parser.parse_args()
    generate_prediction_outcomes(num_rows=args.rows, seed=args.seed)
