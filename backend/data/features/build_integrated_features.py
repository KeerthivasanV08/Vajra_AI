"""
Build Integrated Features and Ground Truth Datasets.
Outputs:
- data/processed/integrated/vajra_feature_dataset.csv
- data/processed/integrated/vajra_ground_truth.csv
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import PROCESSED_DIR
from data.preprocessing.common_preprocessing import save_clean_csv

def build_integrated_features() -> tuple:
    print("[FEATURES] Building integrated features and ground truth dataset...")
    
    user_feat_path = PROCESSED_DIR / "onboarding" / "user_features.csv"
    vel_feat_path = PROCESSED_DIR / "transactions" / "user_velocity.csv"
    onb_feat_path = PROCESSED_DIR / "onboarding" / "onboarding_features.csv"
    geo_feat_path = PROCESSED_DIR / "spatial" / "geo_trajectory_features.csv"
    pred_out_path = PROCESSED_DIR / "operations" / "prediction_outcomes_clean.csv"

    df_u = pd.read_csv(user_feat_path) if user_feat_path.exists() else pd.DataFrame()
    df_v = pd.read_csv(vel_feat_path) if vel_feat_path.exists() else pd.DataFrame()
    df_o = pd.read_csv(onb_feat_path) if onb_feat_path.exists() else pd.DataFrame()
    df_g = pd.read_csv(geo_feat_path) if geo_feat_path.exists() else pd.DataFrame()
    df_p = pd.read_csv(pred_out_path) if pred_out_path.exists() else pd.DataFrame()

    # 1. Integrated Feature Dataset (NO model predictions, NO SHAP, NO future targets)
    df_integrated = df_u.copy()
    if not df_v.empty and "account_id" in df_v.columns:
        df_integrated = df_integrated.merge(df_v.drop(columns=["user_id"], errors="ignore"), on="account_id", how="left")
    if not df_o.empty and "account_id" in df_o.columns:
        df_integrated = df_integrated.merge(df_o.drop(columns=["onboarding_id", "user_id"], errors="ignore"), on="account_id", how="left")
    if not df_g.empty and "account_id" in df_g.columns:
        df_integrated = df_integrated.merge(df_g, on="account_id", how="left")

    df_integrated = df_integrated.fillna(0)
    out_feat_path = PROCESSED_DIR / "integrated" / "vajra_feature_dataset.csv"
    save_clean_csv(df_integrated, out_feat_path, name="VAJRA Integrated Feature Dataset")

    # 2. Ground Truth Dataset (Target dataset for future ML)
    if not df_p.empty:
        df_gt = pd.DataFrame({
            "prediction_id": df_p["prediction_id"],
            "account_id": df_p["account_id"],
            "actual_withdrawal_node_id": df_p["actual_withdrawal_node_id"],
            "actual_withdrawal_lat": df_p["actual_withdrawal_lat"],
            "actual_withdrawal_lon": df_p["actual_withdrawal_lon"],
            "actual_withdrawal_timestamp": df_p["actual_withdrawal_timestamp"],
            "time_to_cashout_mins": df_p["time_to_cashout_mins"],
            "actual_corridor_id": df_p["corridor_id"],
            "actual_intervention_outcome": df_p["intervention_outcome"]
        })
    else:
        df_gt = pd.DataFrame(columns=[
            "prediction_id", "account_id", "actual_withdrawal_node_id",
            "actual_withdrawal_lat", "actual_withdrawal_lon", "actual_withdrawal_timestamp",
            "time_to_cashout_mins", "actual_corridor_id", "actual_intervention_outcome"
        ])

    out_gt_path = PROCESSED_DIR / "integrated" / "vajra_ground_truth.csv"
    save_clean_csv(df_gt, out_gt_path, name="VAJRA Ground Truth Dataset")

    return df_integrated, df_gt

if __name__ == "__main__":
    build_integrated_features()
