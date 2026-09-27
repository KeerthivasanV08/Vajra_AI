"""
Audit module for Model 3 — Spatial Region Model.
"""

import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, f1_score
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR
from backend.ml.common_ml import chronological_split

def audit_model3():
    """
    Perform audit on Model 3 — Spatial Region Prediction Model.
    """
    report = {
        "model_id": "model3_spatial_region",
        "model_name": "Model 3 — Spatial Region Prediction Model",
        "expected_algorithm": "XGBClassifier",
        "status": "PASS",
        "issues": [],
        "warnings": [],
        "checks": {}
    }

    integrated_path = PROCESSED_DIR / "integrated" / "vajra_feature_dataset.csv"
    users_path = PROCESSED_DIR / "onboarding" / "users_clean.csv"

    if not integrated_path.exists():
        report["status"] = "BLOCKED"
        report["issues"].append(f"Feature dataset missing at {integrated_path}")
        return report

    df = pd.read_csv(integrated_path)
    df_u = pd.read_csv(users_path) if users_path.exists() else pd.DataFrame()

    if "state" in df_u.columns and "account_id" in df_u.columns:
        df = df.merge(df_u[["account_id", "state"]], on="account_id", how="left")
        df["region_target"] = df["state"].fillna("Delhi")
    else:
        df["region_target"] = "Delhi"

    feature_cols = [
        "account_age_days", "device_age_days", "domestic_session_ratio",
        "transaction_count", "average_transaction_amount", "total_transaction_amount",
        "device_shared_count", "rolling_1h_sum", "rolling_24h_sum",
        "txn_count_1h", "txn_count_24h", "unique_counterparties_24h",
        "drain_ratio_reference", "fragmentation_score_reference"
    ]
    existing_cols = [c for c in feature_cols if c in df.columns]

    train_df, val_df, test_df = chronological_split(df)

    # Class stats
    num_classes = int(df["region_target"].nunique())
    class_counts = df["region_target"].value_counts().to_dict()
    majority_class = df["region_target"].mode()[0]
    majority_baseline = float((test_df["region_target"] == majority_class).mean())
    random_baseline = float(1.0 / num_classes) if num_classes > 0 else 0.0

    report["checks"]["num_classes"] = num_classes
    report["checks"]["majority_class"] = majority_class
    report["checks"]["majority_baseline_accuracy"] = round(majority_baseline, 4)
    report["checks"]["random_baseline_accuracy"] = round(random_baseline, 4)
    report["checks"]["features"] = existing_cols
    report["checks"]["target"] = "region_target"

    model_path = MODELS_DIR / "spatial_region_model.joblib"
    prep_path = MODELS_DIR / "spatial_region_preprocessor.joblib"

    if model_path.exists() and prep_path.exists():
        model = joblib.load(model_path)
        prep = joblib.load(prep_path)
        scaler = prep["scaler"]
        le = prep["label_encoder"]

        X_test = test_df[existing_cols].fillna(0)
        y_test_raw = test_df["region_target"]

        known_classes = set(le.classes_)
        y_test_clean_raw = y_test_raw.apply(lambda x: x if x in known_classes else le.classes_[0])
        y_test = le.transform(y_test_clean_raw)

        X_test_scaled = scaler.transform(X_test)
        probs = model.predict_proba(X_test_scaled)
        y_pred = np.argmax(probs, axis=1)

        recalc_top1 = float(accuracy_score(y_test, y_pred))
        top3_preds = np.argsort(probs, axis=1)[:, -3:]
        recalc_top3 = float(np.mean([y_test[i] in top3_preds[i] for i in range(len(y_test))]))
        recalc_macro_f1 = float(f1_score(y_test, y_pred, average='macro'))
        recalc_weighted_f1 = float(f1_score(y_test, y_pred, average='weighted'))

        report["checks"]["recalculated_metrics"] = {
            "top1_accuracy": round(recalc_top1, 4),
            "top3_accuracy": round(recalc_top3, 4),
            "macro_f1": round(recalc_macro_f1, 4),
            "weighted_f1": round(recalc_weighted_f1, 4)
        }

        # Compare with reported JSON metrics
        metrics_json_path = EVALUATION_DIR / "model3_spatial_region_metrics.json"
        if metrics_json_path.exists():
            with open(metrics_json_path, "r") as f:
                reported = json.load(f)
            report["checks"]["reported_metrics"] = reported
            diff_acc = abs(recalc_top1 - reported.get("top1_accuracy", reported.get("main_metric_value", 0)))
            if diff_acc > 0.05:
                report["warnings"].append({
                    "code": "METRIC_MISMATCH",
                    "detail": f"Recalculated Top-1 accuracy ({recalc_top1:.4f}) differs from reported ({reported.get('top1_accuracy')})."
                })

        if recalc_top1 < majority_baseline:
            report["warnings"].append({
                "code": "ACCURACY_BELOW_MAJORITY_BASELINE",
                "detail": f"Model Top-1 accuracy ({recalc_top1:.4f}) is lower than majority baseline ({majority_baseline:.4f})."
            })
            if report["status"] == "PASS":
                report["status"] = "PASS_WITH_WARNINGS"

    else:
        report["status"] = "BLOCKED"
        report["issues"].append("Model or preprocessor artifact missing")

    return report

if __name__ == "__main__":
    res = audit_model3()
    print(json.dumps(res, indent=2))
