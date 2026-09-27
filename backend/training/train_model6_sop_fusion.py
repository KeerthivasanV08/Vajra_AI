"""
Train Model 6 — SOP Fusion Engine + Calibration.
Fuses Digital (0.45), Physical (0.35), and Context (0.20) scores, applies Platt Scaling / Isotonic Calibration, and evaluates SOP Tiers.
"""

import sys
import argparse
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.isotonic import IsotonicRegression
from sklearn.metrics import brier_score_loss, confusion_matrix
from sklearn.calibration import calibration_curve

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR, IMAGES_DIR, SEED, W_DIGITAL, W_PHYSICAL, W_CONTEXT
from backend.ml.common_ml import chronological_split, save_model_artifact, save_evaluation_metrics, register_model_in_registry, save_plot

def map_score_to_sop_tier(score: float, cross_border_override: bool = False) -> str:
    """Map calibrated fusion score & override status to prototype SOP action tier."""
    if cross_border_override:
        return "INTERNATIONAL_ALERT_OVERRIDE"
    if score < 0.50:
        return "MONITOR"
    elif score < 0.70:
        return "SOFT_ALERT"
    elif score < 0.85:
        return "RECOMMEND_HOLD"
    else:
        return "ESCALATE_FREEZE"

def train_model6(seed: int = SEED):
    print("=" * 60)
    print("TRAINING MODEL 6: SOP FUSION ENGINE & CALIBRATION")
    print("=" * 60)
    
    integrated_path = PROCESSED_DIR / "integrated" / "vajra_feature_dataset.csv"
    ground_truth_path = PROCESSED_DIR / "integrated" / "vajra_ground_truth.csv"
    cb_path = PROCESSED_DIR / "cross_border" / "cross_border_features.csv"
    
    df = pd.read_csv(integrated_path)
    df_gt = pd.read_csv(ground_truth_path) if ground_truth_path.exists() else pd.DataFrame()
    df_cb = pd.read_csv(cb_path) if cb_path.exists() else pd.DataFrame()
    
    np_rng = np.random.RandomState(seed)
    
    # 1. Synthesize baseline components
    digital = df.get("domestic_session_ratio", pd.Series(np_rng.beta(7, 3, size=len(df)))).clip(0.0, 1.0)
    physical = df.get("fragmentation_score_reference", pd.Series(np_rng.beta(6, 4, size=len(df)))).clip(0.0, 1.0)
    context = df.get("drain_ratio_reference", pd.Series(np_rng.beta(5, 5, size=len(df)))).clip(0.0, 1.0)
    
    # Raw Fusion Score (0.45 Digital + 0.35 Physical + 0.20 Context)
    raw_fusion = (W_DIGITAL * digital + W_PHYSICAL * physical + W_CONTEXT * context).clip(0.0, 1.0)
    
    # Target label: synthetic historical fraud freeze action
    targets = (raw_fusion > 0.65).astype(int)
    
    df_fusion = pd.DataFrame({
        "account_id": df["account_id"],
        "digital_component": digital,
        "physical_component": physical,
        "context_component": context,
        "fusion_score_raw": raw_fusion,
        "target": targets
    })
    
    # Attach cross-border shift flag (for isolated override logic, NOT in weighted average!)
    if not df_cb.empty and "is_foreign_session" in df_cb.columns:
        df_fusion["cross_border_override"] = (df_cb["is_foreign_session"] == 1) & (df_cb.get("vpn_usage_ratio_30d", 0) > 0.5)
    else:
        df_fusion["cross_border_override"] = False

    # Split into train / val / test
    train_df, val_df, test_df = chronological_split(df_fusion)
    
    # 2. Fit Isotonic Calibration model ON VALIDATION SET ONLY (Never fit calibration on test set!)
    calibrator = IsotonicRegression(out_of_bounds='clip')
    calibrator.fit(val_df["fusion_score_raw"], val_df["target"])
    
    # Predict calibrated scores on test set
    test_raw = test_df["fusion_score_raw"].values
    test_calibrated = calibrator.transform(test_raw)
    test_targets = test_df["target"].values
    
    brier_before = float(brier_score_loss(test_targets, test_raw))
    brier_after = float(brier_score_loss(test_targets, test_calibrated))
    
    # Map test set scores to prototype SOP Tiers
    sop_actions = [map_score_to_sop_tier(sc, ov) for sc, ov in zip(test_calibrated, test_df["cross_border_override"].values)]
    
    # Action Tiers distribution
    tier_counts = pd.Series(sop_actions).value_counts().to_dict()
    
    metrics = {
        "model_name": "Model 6 — SOP Fusion Engine & Calibration",
        "algorithm": "Weighted Fusion + Isotonic Calibration",
        "weights": {"digital": W_DIGITAL, "physical": W_PHYSICAL, "context": W_CONTEXT},
        "train_rows": len(train_df),
        "validation_rows": len(val_df),
        "test_rows": len(test_df),
        "main_metric": "Calibrated Brier Score",
        "main_metric_value": round(brier_after, 4),
        "brier_score_raw": round(brier_before, 4),
        "brier_score_calibrated": round(brier_after, 4),
        "brier_improvement": round(brier_before - brier_after, 4),
        "tier_distribution": tier_counts,
        "calibration_status": "CALIBRATED_ON_VAL_SET",
        "evaluation_type": "synthetic_holdout"
    }

    save_model_artifact(calibrator, "sop_calibrator.joblib")
    save_model_artifact({"weights": {"digital": W_DIGITAL, "physical": W_PHYSICAL, "context": W_CONTEXT}}, "sop_preprocessor.joblib")
    save_evaluation_metrics(metrics, "model6_sop_fusion_metrics.json")

    register_model_in_registry({
        "model_id": "model6_sop_fusion",
        "model_name": "Model 6 — SOP Fusion Engine & Calibration",
        "version": "1.0",
        "artifact_path": "backend/models/sop_calibrator.joblib",
        "training_dataset": "vajra_feature_dataset.csv",
        "features": ["digital_component", "physical_component", "context_component"],
        "target": "sop_action_tier",
        "algorithm": "IsotonicRegression Calibration",
        "train_rows": len(train_df),
        "validation_rows": len(val_df),
        "test_rows": len(test_df),
        "metrics": metrics,
        "training_timestamp": pd.Timestamp.now().isoformat(),
        "random_seed": seed
    })

    # Plots
    # 1. model6_sop_fusion_metrics.png (Baseline Comparison)
    fig, ax = plt.subplots(figsize=(7, 5))
    dig_brier = float(brier_score_loss(test_targets, test_df["digital_component"].values))
    phys_brier = float(brier_score_loss(test_targets, test_df["physical_component"].values))
    bars = ax.bar(["Digital Only", "Physical Only", "Raw Fusion", "Calibrated Fusion"], 
                  [dig_brier, phys_brier, brier_before, brier_after], 
                  color=["#95a5a6", "#34495e", "#e74c3c", "#27ae60"])
    ax.set_ylabel("Brier Score Loss (Lower is Better)")
    ax.set_title("Model 6 — SOP Fusion Brier Score Comparison")
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.005, f"{bar.get_height():.4f}", ha='center', fontweight='bold')
    save_plot(fig, "model6_sop_fusion_metrics.png")

    # 2. model6_calibration_before_after.png
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.hist(test_raw, bins=25, alpha=0.5, label="Raw Fusion Scores", color="#e74c3c")
    ax.hist(test_calibrated, bins=25, alpha=0.5, label="Calibrated Scores", color="#27ae60")
    ax.set_xlabel("Probability Score")
    ax.set_ylabel("Frequency")
    ax.set_title("Model 6 — Score Distribution Before vs After Calibration")
    ax.legend()
    save_plot(fig, "model6_calibration_before_after.png")

    # 3. model6_reliability_curve.png
    fig, ax = plt.subplots(figsize=(6, 5))
    prob_true_raw, prob_pred_raw = calibration_curve(test_targets, test_raw, n_bins=10)
    prob_true_cal, prob_pred_cal = calibration_curve(test_targets, test_calibrated, n_bins=10)
    ax.plot(prob_pred_raw, prob_true_raw, "s-", color="#e74c3c", label=f"Uncalibrated (Brier={brier_before:.4f})")
    ax.plot(prob_pred_cal, prob_true_cal, "o-", color="#27ae60", label=f"Calibrated (Brier={brier_after:.4f})")
    ax.plot([0, 1], [0, 1], "k:", label="Perfectly Calibrated")
    ax.set_xlabel("Mean Predicted Probability")
    ax.set_ylabel("Fraction of Positives")
    ax.set_title("Model 6 — Reliability Curve (Calibration Diagram)")
    ax.legend(loc="lower right")
    save_plot(fig, "model6_reliability_curve.png")

    # 4. model6_sop_distribution.png
    fig, ax = plt.subplots(figsize=(7, 5))
    tiers_df = pd.DataFrame(list(tier_counts.items()), columns=["Tier", "Count"])
    sns.barplot(x="Count", y="Tier", data=tiers_df, ax=ax, palette="Greens_r")
    ax.set_xlabel("Count of Test Cases")
    ax.set_title("Model 6 — SOP Action Tier Output Distribution")
    save_plot(fig, "model6_sop_distribution.png")

    print(f"[SUCCESS] Model 6 Brier Score (Calibrated): {brier_after:.4f} (Raw: {brier_before:.4f})")
    return metrics

if __name__ == "__main__":
    train_model6()
