"""
Audit module for Model 5 — Cross-Border Early Warning Model.
"""

import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix
)
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR
from backend.ml.common_ml import chronological_split

def audit_model5():
    """
    Perform audit on Model 5 — Cross-Border Early Warning Model.
    """
    report = {
        "model_id": "model5_cross_border",
        "model_name": "Model 5 — Cross-Border Early Warning Model",
        "expected_algorithm": "LogisticRegression",
        "status": "PASS",
        "issues": [],
        "warnings": [],
        "checks": {}
    }

    cb_path = PROCESSED_DIR / "cross_border" / "cross_border_features.csv"
    raw_cb_path = PROCESSED_DIR / "cross_border" / "cross_border_sessions_clean.csv"

    if not cb_path.exists():
        report["status"] = "BLOCKED"
        report["issues"].append(f"Features dataset missing at {cb_path}")
        return report

    df = pd.read_csv(cb_path)
    df_raw = pd.read_csv(raw_cb_path) if raw_cb_path.exists() else pd.DataFrame()

    if "imminent_overseas_shift_reference" in df_raw.columns:
        df["target"] = df_raw["imminent_overseas_shift_reference"]
    else:
        df["target"] = ((df["vpn_usage_ratio_30d"] > 0.4) & (df["foreign_session_count_7d"] > 2)).astype(int)

    feature_cols = [
        "foreign_session_count_7d", "foreign_session_count_30d", "foreign_country_count",
        "vpn_usage_ratio_30d", "foreign_ip_ratio", "domestic_session_ratio_30d",
        "days_since_onboarding", "hours_since_first_foreign_ip", "country_transition_count", "is_foreign_session"
    ]
    existing_cols = [c for c in feature_cols if c in df.columns]

    train_df, val_df, test_df = chronological_split(df)

    pos_count = int((df["target"] == 1).sum())
    neg_count = int((df["target"] == 0).sum())
    imbalance_ratio = float(pos_count / max(1, len(df)))

    report["checks"]["dataset_rows"] = len(df)
    report["checks"]["positive_samples"] = pos_count
    report["checks"]["negative_samples"] = neg_count
    report["checks"]["positive_ratio"] = round(imbalance_ratio, 4)
    report["checks"]["features"] = existing_cols
    report["checks"]["target"] = "imminent_overseas_shift_reference"

    model_path = MODELS_DIR / "cross_border_model.joblib"
    scaler_path = MODELS_DIR / "cross_border_preprocessor.joblib"

    if model_path.exists() and scaler_path.exists():
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)

        X_test = test_df[existing_cols].fillna(0)
        y_test = test_df["target"]
        X_test_scaled = scaler.transform(X_test)

        probs = model.predict_proba(X_test_scaled)[:, 1]
        y_pred = (probs >= 0.50).astype(int)

        recalc_acc = float(accuracy_score(y_test, y_pred))
        recalc_prec = float(precision_score(y_test, y_pred, zero_division=0))
        recalc_rec = float(recall_score(y_test, y_pred, zero_division=0))
        recalc_f1 = float(f1_score(y_test, y_pred, zero_division=0))
        recalc_roc_auc = float(roc_auc_score(y_test, probs)) if len(set(y_test)) > 1 else 0.5
        recalc_pr_auc = float(average_precision_score(y_test, probs)) if len(set(y_test)) > 1 else 0.0

        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)

        recalc_fnr = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0
        recalc_fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0

        report["checks"]["recalculated_metrics"] = {
            "accuracy": round(recalc_acc, 4),
            "precision": round(recalc_prec, 4),
            "recall": round(recalc_rec, 4),
            "f1_score": round(recalc_f1, 4),
            "roc_auc": round(recalc_roc_auc, 4),
            "pr_auc": round(recalc_pr_auc, 4),
            "false_negative_rate": round(recalc_fnr, 4),
            "false_positive_rate": round(recalc_fpr, 4)
        }

        # Compare with reported JSON metrics
        metrics_json_path = EVALUATION_DIR / "model5_cross_border_metrics.json"
        if metrics_json_path.exists():
            with open(metrics_json_path, "r") as f:
                reported = json.load(f)
            report["checks"]["reported_metrics"] = reported
            diff_auc = abs(recalc_roc_auc - reported.get("roc_auc", reported.get("main_metric_value", 0)))
            if diff_auc > 0.05:
                report["warnings"].append({
                    "code": "METRIC_MISMATCH",
                    "detail": f"Recalculated ROC-AUC ({recalc_roc_auc:.4f}) differs from reported ROC-AUC ({reported.get('roc_auc')})."
                })

        if recalc_roc_auc > 0.98:
            report["warnings"].append({
                "code": "HIGH_ROC_AUC_REQUIRES_REVIEW",
                "detail": f"ROC-AUC = {recalc_roc_auc:.4f} (> 0.98). Synthetic label rule dependency suspect."
            })
            if report["status"] == "PASS":
                report["status"] = "PASS_WITH_WARNINGS"

    else:
        report["status"] = "BLOCKED"
        report["issues"].append("Model or preprocessor artifact missing")

    return report

if __name__ == "__main__":
    res = audit_model5()
    print(json.dumps(res, indent=2))
