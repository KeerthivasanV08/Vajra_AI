"""
Audit module for Model 4 — Node-Level Top-K Re-Ranker Model.
"""

import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR

def audit_model4():
    """
    Perform audit on Model 4 — Node-Level Top-K Re-Ranker Model.
    """
    report = {
        "model_id": "model4_node_ranker",
        "model_name": "Model 4 — Node-Level Top-K Re-Ranker Model",
        "expected_algorithm": "XGBClassifier Ranking",
        "status": "PASS",
        "issues": [],
        "warnings": [],
        "checks": {}
    }

    cand_path = PROCESSED_DIR / "node_ranking_candidates.csv"
    if not cand_path.exists():
        report["status"] = "BLOCKED"
        report["issues"].append(f"Candidate dataset missing at {cand_path}")
        return report

    df = pd.read_csv(cand_path)
    report["checks"]["dataset_path"] = str(cand_path)
    report["checks"]["total_rows"] = len(df)

    feature_cols = [
        "candidate_distance_km", "node_vulnerability_score", "fraud_density_5km",
        "historical_cashout_rate", "trajectory_confidence", "digital_risk_score",
        "mule_probability", "time_of_day", "day_of_week"
    ]
    target_col = "is_actual_cashout_node"

    if target_col not in df.columns or "prediction_id" not in df.columns:
        report["status"] = "BLOCKED"
        report["issues"].append("Target or prediction_id column missing")
        return report

    report["checks"]["features"] = feature_cols
    report["checks"]["target"] = target_col

    # 1. Candidate Generation Leakage Test
    # Check if candidate_distance_km is calculated from actual target node coords during feature creation
    if "candidate_distance_km" in df.columns:
        # Check distance distribution for positive vs negative candidate samples
        target_nodes = df[df[target_col] == 1]
        non_target_nodes = df[df[target_col] == 0]
        
        avg_dist_target = float(target_nodes["candidate_distance_km"].mean()) if not target_nodes.empty else 0
        avg_dist_nontarget = float(non_target_nodes["candidate_distance_km"].mean()) if not non_target_nodes.empty else 0
        
        report["checks"]["avg_distance_target_node_km"] = round(avg_dist_target, 4)
        report["checks"]["avg_distance_nontarget_node_km"] = round(avg_dist_nontarget, 4)
        
        if avg_dist_target == 0.0:
            report["warnings"].append({
                "code": "EXACT_ZERO_DISTANCE_TARGET_CANDIDATE",
                "detail": "Target node candidates always have distance 0.0 km. Verify if candidate shortlist generation includes actual ground-truth coordinates directly."
            })

    # 2. Chronological split by prediction_id
    pred_ids = df["prediction_id"].unique()
    n_preds = len(pred_ids)
    train_preds = pred_ids[:int(n_preds * 0.70)]
    test_preds = pred_ids[int(n_preds * 0.85):]

    train_df = df[df["prediction_id"].isin(train_preds)].copy()
    test_df = df[df["prediction_id"].isin(test_preds)].copy()

    model_path = MODELS_DIR / "node_ranker_model.joblib"
    scaler_path = MODELS_DIR / "node_ranker_preprocessor.joblib"

    if model_path.exists() and scaler_path.exists():
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)

        X_test = test_df[feature_cols].fillna(0)
        X_test_scaled = scaler.transform(X_test)
        test_df["model_score"] = model.predict_proba(X_test_scaled)[:, 1]

        hit1, hit2, hit3, hit5 = [], [], [], []
        mrr_scores = []
        baseline_hit1, baseline_hit3 = [], []

        grouped = test_df.groupby("prediction_id")
        for p_id, group in grouped:
            ranked_model = group.sort_values(by="model_score", ascending=False)
            actual_matches_model = ranked_model[target_col].values
            
            hit1.append(float(np.any(actual_matches_model[:1])))
            hit2.append(float(np.any(actual_matches_model[:2])))
            hit3.append(float(np.any(actual_matches_model[:3])))
            hit5.append(float(np.any(actual_matches_model[:5])))
            
            pos = np.where(actual_matches_model == 1)[0]
            if len(pos) > 0:
                mrr_scores.append(1.0 / (pos[0] + 1))
            else:
                mrr_scores.append(0.0)

            ranked_dist = group.sort_values(by="candidate_distance_km", ascending=True)
            actual_matches_dist = ranked_dist[target_col].values
            baseline_hit1.append(float(np.any(actual_matches_dist[:1])))
            baseline_hit3.append(float(np.any(actual_matches_dist[:3])))

        recalc_h1 = float(np.mean(hit1))
        recalc_h2 = float(np.mean(hit2))
        recalc_h3 = float(np.mean(hit3))
        recalc_h5 = float(np.mean(hit5))
        recalc_mrr = float(np.mean(mrr_scores))
        base_h1 = float(np.mean(baseline_hit1))
        base_h3 = float(np.mean(baseline_hit3))

        report["checks"]["recalculated_metrics"] = {
            "hit_at_1": round(recalc_h1, 4),
            "hit_at_2": round(recalc_h2, 4),
            "hit_at_3": round(recalc_h3, 4),
            "hit_at_5": round(recalc_h5, 4),
            "mrr": round(recalc_mrr, 4),
            "baseline_nearest_hit_at_1": round(base_h1, 4),
            "baseline_nearest_hit_at_3": round(base_h3, 4)
        }

        # Compare with reported JSON metrics
        metrics_json_path = EVALUATION_DIR / "model4_node_ranking_metrics.json"
        if metrics_json_path.exists():
            with open(metrics_json_path, "r") as f:
                reported = json.load(f)
            report["checks"]["reported_metrics"] = reported
            diff_h1 = abs(recalc_h1 - reported.get("hit_at_1", 0))
            if diff_h1 > 0.05:
                report["warnings"].append({
                    "code": "METRIC_MISMATCH",
                    "detail": f"Recalculated Hit@1 ({recalc_h1:.4f}) differs from reported Hit@1 ({reported.get('hit_at_1')})."
                })

        if recalc_h1 > 0.95:
            report["warnings"].append({
                "code": "EXTREMELY_HIGH_HIT1_REQUIRES_LEAKAGE_REVIEW",
                "detail": f"Hit@1 = {recalc_h1:.4f} (> 95%). Candidate selection or ground-truth feature leak suspect."
            })
            if report["status"] == "PASS":
                report["status"] = "PASS_WITH_WARNINGS"

    else:
        report["status"] = "BLOCKED"
        report["issues"].append("Model or preprocessor artifact missing")

    return report

if __name__ == "__main__":
    res = audit_model4()
    print(json.dumps(res, indent=2))
