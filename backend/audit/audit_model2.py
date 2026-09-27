"""
Audit module for Model 2 — Node Vulnerability Model.
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR
from backend.ml.common_ml import chronological_split

def audit_model2():
    """
    Perform audit on Model 2 — Node Vulnerability Model.
    """
    report = {
        "model_id": "model2_node_vulnerability",
        "model_name": "Model 2 — Node Vulnerability Model",
        "expected_algorithm": "XGBRegressor",
        "status": "PASS",
        "issues": [],
        "warnings": [],
        "checks": {}
    }

    # 1. Dataset check
    dataset_path = PROCESSED_DIR / "spatial" / "node_features.csv"
    if not dataset_path.exists():
        report["status"] = "BLOCKED"
        report["issues"].append(f"Training dataset missing at {dataset_path}")
        return report

    df = pd.read_csv(dataset_path)
    report["checks"]["dataset_path"] = str(dataset_path)
    report["checks"]["total_rows"] = len(df)
    report["checks"]["columns_count"] = len(df.columns)

    feature_cols = [
        "historical_txn_volume", "average_daily_transactions", "average_transaction_amount",
        "off_hour_withdrawal_ratio", "historical_cash_withdrawals", "historical_fraud_cashouts",
        "previous_fraud_flags", "distance_to_known_corridor_km", "cash_limit_daily",
        "weekend_active", "historical_cashout_ratio", "historical_fraud_ratio", "activity_density_reference"
    ]
    target_col = "vulnerability_score_reference"

    if target_col not in df.columns:
        report["status"] = "BLOCKED"
        report["issues"].append(f"Target column '{target_col}' missing from dataset")
        return report

    report["checks"]["features"] = feature_cols
    report["checks"]["target"] = target_col

    # 2. Target Construction Dependency Check (Correlation Analysis)
    correlations = {}
    for col in feature_cols:
        if col in df.columns:
            corr = float(df[col].fillna(0).corr(df[target_col]))
            correlations[col] = round(corr, 4)
    
    top_correlations = sorted(correlations.items(), key=lambda x: abs(x[1]), reverse=True)
    report["checks"]["top_feature_target_correlations"] = top_correlations[:5]

    max_corr_feature, max_corr_val = top_correlations[0] if top_correlations else ("", 0)
    if abs(max_corr_val) > 0.90:
        report["warnings"].append({
            "code": "SYNTHETIC_TARGET_CONSTRUCTION_DEPENDENCY",
            "detail": f"Feature '{max_corr_feature}' has very high correlation ({max_corr_val}) with target '{target_col}'."
        })

    # 3. Chronological split & evaluation recalculation
    if "last_updated" in df.columns:
        train_df, val_df, test_df = chronological_split(df, time_col="last_updated")
    else:
        train_df, val_df, test_df = chronological_split(df)

    X_train, y_train = train_df[feature_cols].fillna(0), train_df[target_col]
    X_test, y_test = test_df[feature_cols].fillna(0), test_df[target_col]

    model_path = MODELS_DIR / "node_vulnerability_model.joblib"
    scaler_path = MODELS_DIR / "node_vulnerability_preprocessor.joblib"

    if model_path.exists() and scaler_path.exists():
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)

        X_test_scaled = scaler.transform(X_test)
        y_pred = model.predict(X_test_scaled)
        y_pred = np.clip(y_pred, 0.0, 1.0)

        recalc_mae = float(mean_absolute_error(y_test, y_pred))
        recalc_rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        recalc_r2 = float(r2_score(y_test, y_pred))

        report["checks"]["recalculated_metrics"] = {
            "mae": round(recalc_mae, 4),
            "rmse": round(recalc_rmse, 4),
            "r2": round(recalc_r2, 4)
        }

        # Compare with reported JSON metrics
        metrics_json_path = EVALUATION_DIR / "model2_node_vulnerability_metrics.json"
        if metrics_json_path.exists():
            import json
            with open(metrics_json_path, "r") as f:
                reported = json.load(f)
            report["checks"]["reported_metrics"] = reported
            
            diff_r2 = abs(recalc_r2 - reported.get("r2", reported.get("main_metric_value", 0)))
            if diff_r2 > 0.05:
                report["warnings"].append({
                    "code": "METRIC_MISMATCH",
                    "detail": f"Recalculated R² ({recalc_r2:.4f}) differs from reported R² ({reported.get('r2')})."
                })

        if recalc_r2 > 0.98:
            report["warnings"].append({
                "code": "HIGH_R2_REQUIRES_REVIEW",
                "detail": f"Extremely high R² = {recalc_r2:.4f}. Synthetic target construction dependency suspect."
            })
            if report["status"] == "PASS":
                report["status"] = "PASS_WITH_WARNINGS"

    else:
        report["status"] = "BLOCKED"
        report["issues"].append("Model or preprocessor artifact missing")

    return report

if __name__ == "__main__":
    import json
    res = audit_model2()
    print(json.dumps(res, indent=2))
