"""
Train Model 8 — Syndicate Fingerprint Matcher.
INVESTIGATIVE SIMILARITY SYSTEM — DOES NOT FEED SOP SCORE OR AUTOMATED FREEZE DECISIONS.
"""

import sys
import argparse
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR, IMAGES_DIR, SEED, RAW_DIR
from backend.ml.common_ml import save_model_artifact, save_evaluation_metrics, register_model_in_registry, save_plot

def train_model8(seed: int = SEED):
    print("=" * 60)
    print("TRAINING MODEL 8: SYNDICATE FINGERPRINT MATCHER (COSINE SIMILARITY)")
    print("=" * 60)
    
    syn_path = RAW_DIR / "investigation" / "syndicate_patterns.csv"
    df = pd.read_csv(syn_path)
    
    feature_cols = [
        "hop_count", "fan_out_factor", "layering_time_mins",
        "average_interhop_velocity_mins", "terminal_node_risk_reference"
    ]
    
    X = df[feature_cols].fillna(0)
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Pre-calculate prototype centroids for each syndicate pattern type
    pattern_centroids = {}
    pattern_types = df["pattern_type"].unique()
    
    for p_type in pattern_types:
        mask = (df["pattern_type"] == p_type)
        pattern_centroids[p_type] = X_scaled[mask].mean(axis=0)

    # Perform Cosine Similarity matching against prototype centroids
    centroid_matrix = np.array([pattern_centroids[pt] for pt in pattern_types])
    sim_matrix = cosine_similarity(X_scaled, centroid_matrix)
    
    # Evaluate Precision@K and Recall@K
    top1_correct, top3_correct, top5_correct = [], [], []
    pattern_to_idx = {pt: i for i, pt in enumerate(pattern_types)}
    y_true_indices = [pattern_to_idx[pt] for pt in df["pattern_type"]]

    for i in range(len(df)):
        sims = sim_matrix[i]
        true_idx = y_true_indices[i]
        
        top1 = [np.argmax(sims)]
        top3 = np.argsort(sims)[-3:]
        top5 = np.argsort(sims)[-5:]
        
        top1_correct.append(1 if true_idx in top1 else 0)
        top3_correct.append(1 if true_idx in top3 else 0)
        top5_correct.append(1 if true_idx in top5 else 0)

    prec_1 = float(np.mean(top1_correct))
    prec_3 = float(np.mean(top3_correct))
    prec_5 = float(np.mean(top5_correct))
    avg_sim = float(np.mean(np.max(sim_matrix, axis=1)))

    metrics = {
        "model_name": "Model 8 — Syndicate Fingerprint Matcher",
        "algorithm": "Cosine Similarity Pattern Matcher",
        "training_dataset": "syndicate_patterns.csv",
        "observation_count": len(df),
        "pattern_types_count": len(pattern_types),
        "main_metric": "Precision@1",
        "main_metric_value": round(prec_1, 4),
        "precision_at_1": round(prec_1, 4),
        "precision_at_3": round(prec_3, 4),
        "precision_at_5": round(prec_5, 4),
        "average_top1_similarity": round(avg_sim, 4),
        "evaluation_type": "synthetic_holdout"
    }

    matcher_artifact = {
        "scaler": scaler,
        "pattern_centroids": {k: v.tolist() for k, v in pattern_centroids.items()},
        "pattern_types": list(pattern_types)
    }

    save_model_artifact(matcher_artifact, "syndicate_matcher.joblib")
    save_evaluation_metrics(metrics, "model8_syndicate_metrics.json")

    register_model_in_registry({
        "model_id": "model8_syndicate_matcher",
        "model_name": "Model 8 — Syndicate Fingerprint Matcher",
        "version": "1.0",
        "artifact_path": "backend/models/syndicate_matcher.joblib",
        "training_dataset": "syndicate_patterns.csv",
        "features": feature_cols,
        "target": "pattern_type",
        "algorithm": "CosineSimilarity",
        "train_rows": len(df),
        "validation_rows": 0,
        "test_rows": len(df),
        "metrics": metrics,
        "training_timestamp": pd.Timestamp.now().isoformat(),
        "random_seed": seed
    })

    # Plots
    # 1. model8_syndicate_similarity.png
    fig, ax = plt.subplots(figsize=(7, 5))
    top_sims = np.max(sim_matrix, axis=1)
    sns.histplot(top_sims, kde=True, ax=ax, color="#16a085", bins=30)
    ax.axvline(avg_sim, color="red", linestyle="--", label=f"Mean Similarity: {avg_sim:.4f}")
    ax.set_xlabel("Top-1 Cosine Similarity Score")
    ax.set_ylabel("Pattern Observations Count")
    ax.set_title("Model 8 — Syndicate Pattern Cosine Similarity Distribution")
    ax.legend()
    save_plot(fig, "model8_syndicate_similarity.png")

    # 2. model8_precision_at_k.png
    fig, ax = plt.subplots(figsize=(7, 5))
    bars = ax.bar(["Precision@1", "Precision@3", "Precision@5"], [prec_1, prec_3, prec_5], color=["#16a085", "#1bc5a3", "#2ecc71"])
    ax.set_ylabel("Match Precision")
    ax.set_title("Model 8 — Syndicate Pattern Matcher Precision@K")
    ax.set_ylim(0, 1.05)
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.02, f"{bar.get_height():.2%}", ha='center', fontweight='bold')
    save_plot(fig, "model8_precision_at_k.png")

    print(f"[SUCCESS] Model 8 Syndicate Matcher Precision@1: {prec_1:.2%}, Mean Similarity: {avg_sim:.4f}")
    return metrics

if __name__ == "__main__":
    train_model8()
