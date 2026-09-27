"""
Audit module for Model 6 — SOP Fusion Engine & Calibration.
"""

import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics import brier_score_loss
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, MODELS_DIR, EVALUATION_DIR, W_DIGITAL, W_PHYSICAL, W_CONTEXT
from backend.ml.common_ml import chronological_split

def map_score_to_sop_tier(score: float, cross_border_override: bool = False) -> str:
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

def audit_model6():
    """
    Perform audit on Model 6 — SOP Fusion Engine & Calibration.
    """
    report = {
        "model_id": "model6_sop_fusion",
        "model_name": "Model 6 — SOP Fusion Engine & Calibration",
        "expected_weights": {"digital": 0.45, "physical": 0.35, "context": 0.20},
        "status": "PASS",
        "issues": [],
        "warnings": [],
        "checks": {}
    }

    # 1. Weight architecture check
    actual_weights = {"digital": W_DIGITAL, "physical": W_PHYSICAL, "context": W_CONTEXT}
    report["checks"]["actual_weights"] = actual_weights

    if W_DIGITAL != 0.45 or W_PHYSICAL != 0.35 or W_CONTEXT != 0.20:
        report["status"] = "NEEDS_CORRECTION"
        report["issues"].append(f"CRITICAL ARCHITECTURE VIOLATION: Fusion weights {actual_weights} do not match spec (0.45/0.35/0.20).")

    # 2. Cross-border override isolation check
    # Verify train_model6 code does NOT include cross-border in weighted sum
    train_file = PROJECT_ROOT / "backend" / "training" / "train_model6_sop_fusion.py"
    if train_file.exists():
        with open(train_file, "r") as f:
            code = f.read()
        if "cross_border" in code.lower() and "W_CROSS" in code:
            report["status"] = "NEEDS_CORRECTION"
            report["issues"].append("CRITICAL ARCHITECTURE VIOLATION: Cross-border feature detected inside weighted sum formula.")
        else:
            report["checks"]["cross_border_override_isolated"] = True

    # 3. Calibration on Val set check
    calibrator_path = MODELS_DIR / "sop_calibrator.joblib"
    prep_path = MODELS_DIR / "sop_preprocessor.joblib"

    if not calibrator_path.exists():
        report["status"] = "BLOCKED"
        report["issues"].append("SOP calibrator artifact missing")
        return report

    calibrator = joblib.load(calibrator_path)

    # 4. Evaluation recalculation
    integrated_path = PROCESSED_DIR / "integrated" / "vajra_feature_dataset.csv"
    if not integrated_path.exists():
        report["status"] = "BLOCKED"
        report["issues"].append("Integrated feature dataset missing")
        return report

    df = pd.read_csv(integrated_path)
    np_rng = np.random.RandomState(42)

    digital = df.get("domestic_session_ratio", pd.Series(np_rng.beta(7, 3, size=len(df)))).clip(0.0, 1.0)
    physical = df.get("fragmentation_score_reference", pd.Series(np_rng.beta(6, 4, size=len(df)))).clip(0.0, 1.0)
    context = df.get("drain_ratio_reference", pd.Series(np_rng.beta(5, 5, size=len(df)))).clip(0.0, 1.0)

    raw_fusion = (W_DIGITAL * digital + W_PHYSICAL * physical + W_CONTEXT * context).clip(0.0, 1.0)
    targets = (raw_fusion > 0.65).astype(int)

    df_fusion = pd.DataFrame({
        "account_id": df["account_id"],
        "digital_component": digital,
        "physical_component": physical,
        "context_component": context,
        "fusion_score_raw": raw_fusion,
        "target": targets
    })

    train_df, val_df, test_df = chronological_split(df_fusion)

    test_raw = test_df["fusion_score_raw"].values
    test_calibrated = calibrator.transform(test_raw)
    test_targets = test_df["target"].values

    recalc_raw_brier = float(brier_score_loss(test_targets, test_raw))
    recalc_calibrated_brier = float(brier_score_loss(test_targets, test_calibrated))

    report["checks"]["recalculated_metrics"] = {
        "raw_brier": round(recalc_raw_brier, 4),
        "calibrated_brier": round(recalc_calibrated_brier, 4),
        "brier_improvement": round(recalc_raw_brier - recalc_calibrated_brier, 4)
    }

    metrics_json_path = EVALUATION_DIR / "model6_sop_fusion_metrics.json"
    if metrics_json_path.exists():
        with open(metrics_json_path, "r") as f:
            reported = json.load(f)
        report["checks"]["reported_metrics"] = reported

    if recalc_calibrated_brier < 0.01:
        report["warnings"].append({
            "code": "EXTREMELY_LOW_BRIER_SCORE",
            "detail": f"Calibrated Brier score = {recalc_calibrated_brier:.4f} (< 0.01). Synthetic deterministic target dependency suspect."
        })
        if report["status"] == "PASS":
            report["status"] = "PASS_WITH_WARNINGS"

    return report

if __name__ == "__main__":
    res = audit_model6()
    print(json.dumps(res, indent=2))
