"""
Audit module for Model 7 — Fairness & Governance Bias Audit.
"""

import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import PROCESSED_DIR, EVALUATION_DIR

def audit_model7():
    """
    Perform audit on Model 7 — Fairness & Governance Bias Audit.
    """
    report = {
        "model_id": "model7_fairness_audit",
        "model_name": "Model 7 — Fairness & Governance Bias Audit",
        "is_non_scoring_governance_layer": True,
        "status": "PASS",
        "issues": [],
        "warnings": [],
        "checks": {}
    }

    audit_json_path = EVALUATION_DIR / "fairness_audit.json"
    if not audit_json_path.exists():
        report["status"] = "BLOCKED"
        report["issues"].append(f"Fairness audit JSON missing at {audit_json_path}")
        return report

    with open(audit_json_path, "r") as f:
        audit_data = json.load(f)

    df_audit = pd.DataFrame(audit_data)
    report["checks"]["groups_analyzed_count"] = len(df_audit)
    report["checks"]["groups_list"] = df_audit["group"].tolist() if "group" in df_audit.columns else []

    # Check sample sizes per group
    small_groups = []
    if "prediction_count" in df_audit.columns:
        for idx, row in df_audit.iterrows():
            if row["prediction_count"] < 30:
                small_groups.append({"group": row["group"], "count": int(row["prediction_count"])})

    report["checks"]["small_sample_groups"] = small_groups
    if small_groups:
        report["warnings"].append({
            "code": "SMALL_SAMPLE_SIZE_GROUPS",
            "detail": f"{len(small_groups)} groups have < 30 predictions. DIR calculations may be noisy."
        })

    # Check Disparate Impact Ratio (DIR) thresholds (80% rule: DIR < 0.80 indicates potential disparate impact)
    disparate_impact_groups = []
    if "disparate_impact_ratio" in df_audit.columns:
        for idx, row in df_audit.iterrows():
            if row["disparate_impact_ratio"] < 0.80:
                disparate_impact_groups.append({"group": row["group"], "dir": float(row["disparate_impact_ratio"])})

    report["checks"]["disparate_impact_groups"] = disparate_impact_groups
    if disparate_impact_groups:
        report["warnings"].append({
            "code": "DISPARATE_IMPACT_DETECTED",
            "detail": f"{len(disparate_impact_groups)} groups have DIR < 0.80."
        })
        if report["status"] == "PASS":
            report["status"] = "PASS_WITH_WARNINGS"

    metrics_json_path = EVALUATION_DIR / "model7_fairness_metrics.json"
    if metrics_json_path.exists():
        with open(metrics_json_path, "r") as f:
            reported = json.load(f)
        report["checks"]["reported_metrics"] = reported

    return report

if __name__ == "__main__":
    res = audit_model7()
    print(json.dumps(res, indent=2))
