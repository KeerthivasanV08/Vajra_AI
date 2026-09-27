"""
Train Model 4 — Node-Level Top-K Re-Ranker Model.
Target: is_actual_cashout_node (Binary Candidate Classification & Ranking Task using XGBoost).
"""

import sys
import argparse
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR, IMAGES_DIR, SEED
from backend.ml.common_ml import chronological_split, save_model_artifact, save_evaluation_metrics, register_model_in_registry, save_plot

def train_model4(seed: int = SEED):
    print("=" * 60)
    print("TRAINING MODEL 4: NODE-LEVEL TOP-K RE-RANKER MODEL (XGBOOST)")
    print("=" * 60)
    
    cand_path = PROCESSED_DIR / "node_ranking_candidates.csv"
    if not cand_path.exists():
        from data.preprocessing.build_candidate_dataset import build_candidate_dataset
        build_candidate_dataset()
        
    df = pd.read_csv(cand_path)
    
    # Chronological split by prediction_id
    pred_ids = df["prediction_id"].unique()
    n_preds = len(pred_ids)
    train_preds = pred_ids[:int(n_preds * 0.70)]
    val_preds = pred_ids[int(n_preds * 0.70):int(n_preds * 0.85)]
    test_preds = pred_ids[int(n_preds * 0.85):]
    
    train_df = df[df["prediction_id"].isin(train_preds)].copy()
    val_df = df[df["prediction_id"].isin(val_preds)].copy()
    test_df = df[df["prediction_id"].isin(test_preds)].copy()
    
    feature_cols = [
        "candidate_distance_km", "node_vulnerability_score", "fraud_density_5km",
        "historical_cashout_rate", "trajectory_confidence", "digital_risk_score",
        "mule_probability", "time_of_day", "day_of_week"
    ]
    
    X_train, y_train = train_df[feature_cols].fillna(0), train_df["is_actual_cashout_node"]
    X_test, y_test = test_df[feature_cols].fillna(0), test_df["is_actual_cashout_node"]
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train binary classification ranker
    model = XGBClassifier(n_estimators=120, learning_rate=0.08, max_depth=5, random_state=seed, n_jobs=-1)
    model.fit(X_train_scaled, y_train)
    
    # Predict ranking scores on test candidates
    test_df["model_score"] = model.predict_proba(X_test_scaled)[:, 1]
    
    # Evaluate Top-K metrics per prediction group
    hit1, hit2, hit3, hit5 = [], [], [], []
    mrr_scores = []
    baseline_hit1, baseline_hit3 = [], []

    grouped = test_df.groupby("prediction_id")
    for p_id, group in grouped:
        # Model ranking (descending model score)
        ranked_model = group.sort_values(by="model_score", ascending=False)
        actual_matches_model = ranked_model["is_actual_cashout_node"].values
        
        hit1.append(float(np.any(actual_matches_model[:1])))
        hit2.append(float(np.any(actual_matches_model[:2])))
        hit3.append(float(np.any(actual_matches_model[:3])))
        hit5.append(float(np.any(actual_matches_model[:5])))
        
        # MRR
        pos = np.where(actual_matches_model == 1)[0]
        if len(pos) > 0:
            mrr_scores.append(1.0 / (pos[0] + 1))
        else:
            mrr_scores.append(0.0)
            
        # Baseline ranking (nearest distance only)
        ranked_dist = group.sort_values(by="candidate_distance_km", ascending=True)
        actual_matches_dist = ranked_dist["is_actual_cashout_node"].values
        baseline_hit1.append(float(np.any(actual_matches_dist[:1])))
        baseline_hit3.append(float(np.any(actual_matches_dist[:3])))

    h1 = float(np.mean(hit1))
    h2 = float(np.mean(hit2))
    h3 = float(np.mean(hit3))
    h5 = float(np.mean(hit5))
    mrr = float(np.mean(mrr_scores))
    
    base_h1 = float(np.mean(baseline_hit1))
    base_h3 = float(np.mean(baseline_hit3))

    metrics = {
        "model_name": "Model 4 — Node-Level Top-K Re-Ranker Model",
        "algorithm": "XGBClassifier Ranking",
        "training_dataset": "node_ranking_candidates.csv",
        "train_rows": len(train_df),
        "test_rows": len(test_df),
        "test_predictions_count": len(test_preds),
        "main_metric": "Top-3 Precision (Hit@3)",
        "main_metric_value": round(h3, 4),
        "hit_at_1": round(h1, 4),
        "hit_at_2": round(h2, 4),
        "hit_at_3": round(h3, 4),
        "hit_at_5": round(h5, 4),
        "mrr": round(mrr, 4),
        "baseline_nearest_hit_at_1": round(base_h1, 4),
        "baseline_nearest_hit_at_3": round(base_h3, 4),
        "evaluation_type": "synthetic_holdout"
    }

    save_model_artifact(model, "node_ranker_model.joblib")
    save_model_artifact(scaler, "node_ranker_preprocessor.joblib")
    save_evaluation_metrics(metrics, "model4_node_ranking_metrics.json")

    register_model_in_registry({
        "model_id": "model4_node_ranker",
        "model_name": "Model 4 — Node-Level Top-K Re-Ranker Model",
        "version": "1.0",
        "artifact_path": "backend/models/node_ranker_model.joblib",
        "training_dataset": "node_ranking_candidates.csv",
        "features": feature_cols,
        "target": "is_actual_cashout_node",
        "algorithm": "XGBClassifier",
        "train_rows": len(train_df),
        "validation_rows": len(val_df),
        "test_rows": len(test_df),
        "metrics": metrics,
        "training_timestamp": pd.Timestamp.now().isoformat(),
        "random_seed": seed
    })

    # Plots
    # 1. model4_node_ranking_metrics.png
    fig, ax = plt.subplots(figsize=(7, 5))
    bars = ax.bar(["Hit@1", "Hit@2", "Hit@3", "Hit@5", "MRR"], [h1, h2, h3, h5, mrr], color=["#8e44ad", "#9b59b6", "#2980b9", "#27ae60", "#f39c12"])
    ax.set_ylabel("Score")
    ax.set_title("Model 4 — Node Re-Ranking Top-K Precision & MRR")
    ax.set_ylim(0, 1.05)
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.02, f"{bar.get_height():.2%}", ha='center', fontweight='bold')
    save_plot(fig, "model4_node_ranking_metrics.png")

    # 2. model4_topk_accuracy.png
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot(["Top-1", "Top-3"], [base_h1, base_h3], marker='o', label="Nearest Distance Baseline", color="#7f8c8d", linewidth=2)
    ax.plot(["Top-1", "Top-2", "Top-3", "Top-5"], [h1, h2, h3, h5], marker='s', label="XGBoost Re-Ranker", color="#8e44ad", linewidth=2.5)
    ax.set_ylabel("Accuracy / Precision@K")
    ax.set_title("Model 4 — Top-K Accuracy Comparison vs Nearest Neighbor Baseline")
    ax.set_ylim(0, 1.05)
    ax.legend()
    save_plot(fig, "model4_topk_accuracy.png")

    # 3. model4_rank_distribution.png
    fig, ax = plt.subplots(figsize=(7, 5))
    ranks = [pos[0] + 1 for pos in [np.where(group.sort_values(by="model_score", ascending=False)["is_actual_cashout_node"].values == 1)[0] for _, group in grouped] if len(pos) > 0]
    sns.histplot(ranks, discrete=True, color="#8e44ad", ax=ax)
    ax.set_xlabel("Predicted Rank of Actual Node")
    ax.set_ylabel("Count of Predictions")
    ax.set_title("Model 4 — Rank Distribution of Target Node")
    save_plot(fig, "model4_rank_distribution.png")

    # 4. model4_node_ranker_feature_importance.png
    fig, ax = plt.subplots(figsize=(8, 6))
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    sns.barplot(x=importances[sorted_idx], y=np.array(feature_cols)[sorted_idx], ax=ax, palette="Purples_r")
    ax.set_xlabel("XGBoost Feature Importance")
    ax.set_title("Model 4 — Node Re-Ranker Feature Importances")
    save_plot(fig, "model4_node_ranker_feature_importance.png")

    print(f"[SUCCESS] Model 4 Node Ranker Hit@1: {h1:.2%}, Hit@3: {h3:.2%}, MRR: {mrr:.4f}")
    return metrics

if __name__ == "__main__":
    train_model4()
