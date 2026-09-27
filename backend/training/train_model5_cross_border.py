"""
Train Model 5 — Cross-Border Early Warning Model.
Target: imminent_overseas_shift_reference (Binary Classification Task using LogisticRegression / XGBoost).
"""

import sys
import argparse
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, roc_curve, precision_recall_curve, average_precision_score, confusion_matrix
)
from sklearn.preprocessing import StandardScaler

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR, IMAGES_DIR, SEED
from backend.ml.common_ml import chronological_split, save_model_artifact, save_evaluation_metrics, register_model_in_registry, save_plot

def train_model5(seed: int = SEED):
    print("=" * 60)
    print("TRAINING MODEL 5: CROSS-BORDER EARLY WARNING MODEL (LOGISTIC REGRESSION)")
    print("=" * 60)
    
    cb_path = PROCESSED_DIR / "cross_border" / "cross_border_features.csv"
    raw_cb_path = PROCESSED_DIR / "cross_border" / "cross_border_sessions_clean.csv"
    
    df = pd.read_csv(cb_path)
    df_raw = pd.read_csv(raw_cb_path) if raw_cb_path.exists() else pd.DataFrame()
    
    if "imminent_overseas_shift_reference" in df_raw.columns:
        df["target"] = df_raw["imminent_overseas_shift_reference"]
    else:
        df["target"] = ((df["vpn_usage_ratio_30d"] > 0.4) & (df["foreign_session_count_7d"] > 2)).astype(int)

    train_df, val_df, test_df = chronological_split(df)
    
    feature_cols = [
        "foreign_session_count_7d", "foreign_session_count_30d", "foreign_country_count",
        "vpn_usage_ratio_30d", "foreign_ip_ratio", "domestic_session_ratio_30d",
        "days_since_onboarding", "hours_since_first_foreign_ip", "country_transition_count", "is_foreign_session"
    ]
    
    X_train, y_train = train_df[feature_cols].fillna(0), train_df["target"]
    X_test, y_test = test_df[feature_cols].fillna(0), test_df["target"]
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Logistic Regression Baseline Early-Warning Model
    model = LogisticRegression(random_state=seed, max_iter=1000)
    model.fit(X_train_scaled, y_train)
    
    probs = model.predict_proba(X_test_scaled)[:, 1]
    y_pred = (probs >= 0.50).astype(int)
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, probs))
    pr_auc = float(average_precision_score(y_test, probs))
    
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
    
    fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0

    metrics = {
        "model_name": "Model 5 — Cross-Border Early Warning Model",
        "algorithm": "LogisticRegression Classifier",
        "training_dataset": "cross_border_features.csv",
        "train_rows": len(train_df),
        "test_rows": len(test_df),
        "main_metric": "ROC-AUC",
        "main_metric_value": round(roc_auc, 4),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "false_negative_rate": round(fnr, 4),
        "false_positive_rate": round(fpr, 4),
        "evaluation_type": "synthetic_holdout"
    }

    save_model_artifact(model, "cross_border_model.joblib")
    save_model_artifact(scaler, "cross_border_preprocessor.joblib")
    save_evaluation_metrics(metrics, "model5_cross_border_metrics.json")

    register_model_in_registry({
        "model_id": "model5_cross_border",
        "model_name": "Model 5 — Cross-Border Early Warning Model",
        "version": "1.0",
        "artifact_path": "backend/models/cross_border_model.joblib",
        "training_dataset": "cross_border_features.csv",
        "features": feature_cols,
        "target": "imminent_overseas_shift_reference",
        "algorithm": "LogisticRegression",
        "train_rows": len(train_df),
        "validation_rows": len(val_df),
        "test_rows": len(test_df),
        "metrics": metrics,
        "training_timestamp": pd.Timestamp.now().isoformat(),
        "random_seed": seed
    })

    # Plots
    # 1. model5_cross_border_metrics.png
    fig, ax = plt.subplots(figsize=(7, 5))
    bars = ax.bar(["ROC-AUC", "PR-AUC", "F1 Score", "Recall", "FNR (Error)"], 
                  [roc_auc, pr_auc, f1, rec, fnr], 
                  color=["#2980b9", "#16a085", "#27ae60", "#f39c12", "#c0392b"])
    ax.set_ylabel("Score")
    ax.set_title("Model 5 — Cross-Border Early Warning Performance Metrics")
    ax.set_ylim(0, 1.05)
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.02, f"{bar.get_height():.2%}", ha='center', fontweight='bold')
    save_plot(fig, "model5_cross_border_metrics.png")

    # 2. model5_cross_border_confusion_matrix.png
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Reds', xticklabels=["DOMESTIC", "SHIFT_WARNING"], yticklabels=["DOMESTIC", "SHIFT_WARNING"], ax=ax)
    ax.set_xlabel("Predicted Class")
    ax.set_ylabel("Actual Class")
    ax.set_title("Model 5 — Early Warning Confusion Matrix")
    save_plot(fig, "model5_cross_border_confusion_matrix.png")

    # 3. model5_cross_border_roc_curve.png
    fig, ax = plt.subplots(figsize=(6, 5))
    fpr_vals, tpr_vals, _ = roc_curve(y_test, probs)
    ax.plot(fpr_vals, tpr_vals, color='#e74c3c', lw=2, label=f'ROC curve (AUC = {roc_auc:.4f})')
    ax.plot([0, 1], [0, 1], color='navy', lw=1, linestyle='--')
    ax.set_xlabel('False Positive Rate')
    ax.set_ylabel('True Positive Rate')
    ax.set_title('Model 5 — Receiver Operating Characteristic (ROC)')
    ax.legend(loc="lower right")
    save_plot(fig, "model5_cross_border_roc_curve.png")

    # 4. model5_cross_border_pr_curve.png
    fig, ax = plt.subplots(figsize=(6, 5))
    prec_vals, rec_vals, _ = precision_recall_curve(y_test, probs)
    ax.plot(rec_vals, prec_vals, color='#8e44ad', lw=2, label=f'PR curve (AUC = {pr_auc:.4f})')
    ax.set_xlabel('Recall')
    ax.set_ylabel('Precision')
    ax.set_title('Model 5 — Precision-Recall Curve')
    ax.legend(loc="lower left")
    save_plot(fig, "model5_cross_border_pr_curve.png")

    # 5. model5_cross_border_feature_importance.png
    fig, ax = plt.subplots(figsize=(8, 6))
    coefs = model.coef_[0]
    sorted_idx = np.argsort(np.abs(coefs))[::-1]
    sns.barplot(x=coefs[sorted_idx], y=np.array(feature_cols)[sorted_idx], ax=ax, palette="Reds_r")
    ax.set_xlabel("Logistic Regression Coefficient Weight")
    ax.set_title("Model 5 — Feature Importance (Coefficients)")
    save_plot(fig, "model5_cross_border_feature_importance.png")

    print(f"[SUCCESS] Model 5 Cross Border ROC-AUC: {roc_auc:.4f}, Recall: {rec:.2%}, FNR: {fnr:.2%}")
    return metrics

if __name__ == "__main__":
    train_model5()
