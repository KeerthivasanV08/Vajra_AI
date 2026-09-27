"""
Master Training Runner for VAJRA Platform.
Executes all model training scripts (Models 1 to 8) in strict order, generates overall comparisons and plot summaries.
"""

import sys
import json
import argparse
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import EVALUATION_DIR, IMAGES_DIR, SEED
from backend.ml.common_ml import save_plot
from backend.training.train_model1_trajectory import train_model1
from backend.training.train_model2_node_vulnerability import train_model2
from backend.training.train_model3_spatial_region import train_model3
from backend.training.train_model4_node_ranker import train_model4
from backend.training.train_model5_cross_border import train_model5
from backend.training.train_model6_sop_fusion import train_model6
from backend.training.run_fairness_audit import run_fairness_audit
from backend.training.train_model8_syndicate_matcher import train_model8
from data.preprocessing.build_candidate_dataset import build_candidate_dataset

def train_all_models(seed: int = SEED):
    print("=" * 70)
    print("VAJRA MASTER MODEL TRAINING & EVALUATION PIPELINE")
    print(f"Random Seed: {seed}")
    print("=" * 70)
    
    # Step 1: Model 1 Trajectory
    m1 = train_model1(seed=seed)
    
    # Step 2: Model 2 Node Vulnerability
    m2 = train_model2(seed=seed)
    
    # Step 3: Candidate Generation (NON-ML)
    build_candidate_dataset(top_k_candidates=20)
    
    # Step 4: Model 3 Spatial Region
    m3 = train_model3(seed=seed)
    
    # Step 5: Model 4 Node Re-Ranker
    m4 = train_model4(seed=seed)
    
    # Step 6: Model 5 Cross-Border Early Warning
    m5 = train_model5(seed=seed)
    
    # Step 7: Model 6 SOP Fusion Engine + Calibration
    m6 = train_model6(seed=seed)
    
    # Step 8: Model 7 Fairness & Governance Audit
    m7 = run_fairness_audit(seed=seed)
    
    # Step 9: Model 8 Syndicate Fingerprint Matcher
    m8 = train_model8(seed=seed)

    print("=" * 70)
    print("GENERATING OVERALL MODEL COMPARISON SUMMARY & PLOTS")
    print("=" * 70)

    comparison = [
        {"model": "Model 1 — Trajectory", "task": "Sequence Classification", "main_metric": "Top-1 Cell Accuracy", "model_score": m1["top1_accuracy"], "baseline_score": m1["baseline_top1_accuracy"]},
        {"model": "Model 2 — Vulnerability", "task": "Regression", "main_metric": "R2 Score", "model_score": m2["r2"], "baseline_score": 0.0},
        {"model": "Model 3 — Spatial Region", "task": "Multiclass Classification", "main_metric": "Top-1 Region Accuracy", "model_score": m3["top1_accuracy"], "baseline_score": m3["baseline_top1_accuracy"]},
        {"model": "Model 4 — Node Ranker", "task": "Candidate Ranking", "main_metric": "Top-3 Precision (Hit@3)", "model_score": m4["hit_at_3"], "baseline_score": m4["baseline_nearest_hit_at_3"]},
        {"model": "Model 5 — Cross-Border", "task": "Early Warning Classification", "main_metric": "ROC-AUC Score", "model_score": m5["roc_auc"], "baseline_score": 0.50},
        {"model": "Model 6 — SOP Fusion", "task": "Calibration / Scoring", "main_metric": "Calibrated Brier (1-Loss)", "model_score": round(1.0 - m6["brier_score_calibrated"], 4), "baseline_score": round(1.0 - m6["brier_score_raw"], 4)},
        {"model": "Model 8 — Syndicate", "task": "Cosine Similarity Matching", "main_metric": "Precision@1", "model_score": m8["precision_at_1"], "baseline_score": 0.20}
    ]

    # Save overall_model_comparison.json
    comp_json_path = EVALUATION_DIR / "overall_model_comparison.json"
    with open(comp_json_path, "w") as f:
        json.dump(comparison, f, indent=2)
    print(f"[COMPARISON] Saved comparison -> {comp_json_path}")

    # Plot 1: all_models_performance_summary.png
    fig, ax = plt.subplots(figsize=(10, 6))
    df_comp = pd.DataFrame(comparison)
    sns.barplot(x="model_score", y="model", data=df_comp, ax=ax, palette="viridis")
    ax.set_xlabel("Primary Metric Score")
    ax.set_title("VAJRA ML Suite — Model Performance Summary")
    ax.set_xlim(0, 1.1)
    for i, row in df_comp.iterrows():
        ax.text(row["model_score"] + 0.01, i, f"{row['model_score']:.4f}", va='center', fontweight='bold')
    save_plot(fig, "all_models_performance_summary.png")

    # Plot 2: model_comparison_baselines.png
    fig, ax = plt.subplots(figsize=(10, 6))
    x = np.arange(len(df_comp))
    width = 0.35
    ax.barh(x - width/2, df_comp["model_score"], width, label="VAJRA Trained Model", color="#27ae60")
    ax.barh(x + width/2, df_comp["baseline_score"], width, label="Baseline Strategy", color="#95a5a6")
    ax.set_yticks(x)
    ax.set_yticklabels(df_comp["model"])
    ax.set_xlabel("Metric Value")
    ax.set_title("VAJRA ML Suite — Trained Models vs Baselines Comparison")
    ax.legend()
    save_plot(fig, "model_comparison_baselines.png")

    print("=" * 70)
    print("ALL MODELS TRAINED AND EVALUATED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=int, default=SEED)
    args = parser.parse_args()
    train_all_models(seed=args.seed)
