"""
Train Model 3 — Spatial Region Prediction Model.
Target: predicted_region (Coarse Multiclass Classification Task using XGBoost).
"""

import sys
import argparse
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder, StandardScaler

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR, IMAGES_DIR, SEED
from backend.ml.common_ml import chronological_split, save_model_artifact, save_evaluation_metrics, register_model_in_registry, save_plot

def train_model3(seed: int = SEED):
    print("=" * 60)
    print("TRAINING MODEL 3: SPATIAL REGION PREDICTION MODEL (XGBOOST)")
    print("=" * 60)
    
    integrated_path = PROCESSED_DIR / "integrated" / "vajra_feature_dataset.csv"
    users_path = PROCESSED_DIR / "onboarding" / "users_clean.csv"
    
    df = pd.read_csv(integrated_path)
    df_u = pd.read_csv(users_path) if users_path.exists() else pd.DataFrame()
    
    if "state" in df_u.columns and "account_id" in df_u.columns:
        df = df.merge(df_u[["account_id", "state"]], on="account_id", how="left")
        df["region_target"] = df["state"].fillna("Delhi")
    else:
        df["region_target"] = "Delhi"

    train_df, val_df, test_df = chronological_split(df)
    
    feature_cols = [
        "account_age_days", "device_age_days", "domestic_session_ratio",
        "transaction_count", "average_transaction_amount", "total_transaction_amount",
        "device_shared_count", "rolling_1h_sum", "rolling_24h_sum",
        "txn_count_1h", "txn_count_24h", "unique_counterparties_24h",
        "drain_ratio_reference", "fragmentation_score_reference"
    ]

    existing_cols = [c for c in feature_cols if c in df.columns]
    
    X_train, y_train_raw = train_df[existing_cols].fillna(0), train_df["region_target"]
    X_test, y_test_raw = test_df[existing_cols].fillna(0), test_df["region_target"]
    
    le = LabelEncoder()
    y_train = le.fit_transform(y_train_raw)
    
    known_classes = set(le.classes_)
    y_test_clean_raw = y_test_raw.apply(lambda x: x if x in known_classes else le.classes_[0])
    y_test = le.transform(y_test_clean_raw)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=seed, n_jobs=-1)
    model.fit(X_train_scaled, y_train)
    
    probs = model.predict_proba(X_test_scaled)
    y_pred = np.argmax(probs, axis=1)
    
    top1_acc = float(accuracy_score(y_test, y_pred))
    
    top3_preds = np.argsort(probs, axis=1)[:, -3:]
    top3_acc = float(np.mean([y_test[i] in top3_preds[i] for i in range(len(y_test))]))
    
    macro_f1 = float(f1_score(y_test, y_pred, average='macro'))
    weighted_f1 = float(f1_score(y_test, y_pred, average='weighted'))
    
    baseline_top1 = float((y_test_raw == train_df["region_target"].mode()[0]).mean())
    
    metrics = {
        "model_name": "Model 3 — Spatial Region Prediction Model",
        "algorithm": "XGBClassifier Multiclass",
        "training_dataset": "vajra_feature_dataset.csv",
        "train_rows": len(train_df),
        "test_rows": len(test_df),
        "main_metric": "Top-1 Region Accuracy",
        "main_metric_value": round(top1_acc, 4),
        "top1_accuracy": round(top1_acc, 4),
        "top3_accuracy": round(top3_acc, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "baseline_top1_accuracy": round(baseline_top1, 4),
        "evaluation_type": "synthetic_holdout"
    }
    
    save_model_artifact(model, "spatial_region_model.joblib")
    save_model_artifact({"scaler": scaler, "label_encoder": le}, "spatial_region_preprocessor.joblib")
    save_evaluation_metrics(metrics, "model3_spatial_region_metrics.json")
    
    register_model_in_registry({
        "model_id": "model3_spatial_region",
        "model_name": "Model 3 — Spatial Region Prediction Model",
        "version": "1.0",
        "artifact_path": "backend/models/spatial_region_model.joblib",
        "training_dataset": "vajra_feature_dataset.csv",
        "features": existing_cols,
        "target": "region_target",
        "algorithm": "XGBClassifier",
        "train_rows": len(train_df),
        "validation_rows": len(val_df),
        "test_rows": len(test_df),
        "metrics": metrics,
        "training_timestamp": pd.Timestamp.now().isoformat(),
        "random_seed": seed
    })
    
    # Plots
    # 1. model3_spatial_region_metrics.png
    fig, ax = plt.subplots(figsize=(7, 5))
    bars = ax.bar(["Baseline Top-1", "Model Top-1", "Model Top-3", "Weighted F1"], 
                  [baseline_top1, top1_acc, top3_acc, weighted_f1], 
                  color=["#95a5a6", "#2980b9", "#3498db", "#16a085"])
    ax.set_ylabel("Score")
    ax.set_title("Model 3 — Spatial Region Prediction Performance")
    ax.set_ylim(0, 1.05)
    for bar in bars:
        ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 0.02, f"{bar.get_height():.2%}", ha='center', fontweight='bold')
    save_plot(fig, "model3_spatial_region_metrics.png")
    
    # 2. model3_spatial_region_confusion_matrix.png
    fig, ax = plt.subplots(figsize=(8, 6))
    top_classes = list(le.classes_[:8])
    cm = confusion_matrix(y_test, y_pred)[:8, :8]
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=top_classes, yticklabels=top_classes, ax=ax)
    ax.set_xlabel("Predicted Region")
    ax.set_ylabel("Actual Region")
    ax.set_title("Model 3 — Coarse Region Confusion Matrix")
    save_plot(fig, "model3_spatial_region_confusion_matrix.png")
    
    # 3. model3_spatial_region_feature_importance.png
    fig, ax = plt.subplots(figsize=(8, 6))
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    sns.barplot(x=importances[sorted_idx], y=np.array(existing_cols)[sorted_idx], ax=ax, palette="Blues_r")
    ax.set_xlabel("XGBoost Feature Importance")
    ax.set_title("Model 3 — Spatial Region Feature Importances")
    save_plot(fig, "model3_spatial_region_feature_importance.png")
    
    print(f"[SUCCESS] Model 3 Spatial Region Top-1 Acc: {top1_acc:.2%}, Macro F1: {macro_f1:.4f}")
    return metrics

if __name__ == "__main__":
    train_model3()
