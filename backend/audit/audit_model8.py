"""
Audit module for Model 8 — Syndicate Fingerprint Matcher.
"""

import sys
import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import RAW_DIR, MODELS_DIR, EVALUATION_DIR

def audit_model8():
    """
    Perform audit on Model 8 — Syndicate Fingerprint Matcher.
    """
    report = {
        "model_id": "model8_syndicate_matcher",
        "model_name": "Model 8 — Syndicate Fingerprint Matcher",
        "is_investigative_similarity_system": True,
        "status": "PASS",
        "issues": [],
        "warnings": [],
        "checks": {}
    }

    syn_path = RAW_DIR / "investigation" / "syndicate_patterns.csv"
    if not syn_path.exists():
        report["status"] = "BLOCKED"
        report["issues"].append(f"Syndicate patterns dataset missing at {syn_path}")
        return report

    df = pd.read_csv(syn_path)
    feature_cols = [
        "hop_count", "fan_out_factor", "layering_time_mins",
        "average_interhop_velocity_mins", "terminal_node_risk_reference"
    ]
    existing_cols = [c for c in feature_cols if c in df.columns]

    report["checks"]["dataset_rows"] = len(df)
    report["checks"]["features"] = existing_cols
    report["checks"]["pattern_types"] = df["pattern_type"].unique().tolist() if "pattern_type" in df.columns else []

    matcher_path = MODELS_DIR / "syndicate_matcher.joblib"
    if not matcher_path.exists():
        report["status"] = "BLOCKED"
        report["issues"].append("Syndicate matcher artifact missing")
        return report

    matcher_artifact = joblib.load(matcher_path)
    scaler = matcher_artifact["scaler"]
    centroids_dict = matcher_artifact["pattern_centroids"]
    pattern_types = matcher_artifact["pattern_types"]

    X = df[existing_cols].fillna(0)
    X_scaled = scaler.transform(X)

    centroid_matrix = np.array([centroids_dict[pt] for pt in pattern_types])
    sim_matrix = cosine_similarity(X_scaled, centroid_matrix)

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

    recalc_p1 = float(np.mean(top1_correct))
    recalc_p3 = float(np.mean(top3_correct))
    recalc_p5 = float(np.mean(top5_correct))
    avg_sim = float(np.mean(np.max(sim_matrix, axis=1)))

    report["checks"]["recalculated_metrics"] = {
        "precision_at_1": round(recalc_p1, 4),
        "precision_at_3": round(recalc_p3, 4),
        "precision_at_5": round(recalc_p5, 4),
        "average_top1_similarity": round(avg_sim, 4)
    }

    metrics_json_path = EVALUATION_DIR / "model8_syndicate_metrics.json"
    if metrics_json_path.exists():
        with open(metrics_json_path, "r") as f:
            reported = json.load(f)
        report["checks"]["reported_metrics"] = reported
        diff_p1 = abs(recalc_p1 - reported.get("precision_at_1", reported.get("main_metric_value", 0)))
        if diff_p1 > 0.05:
            report["warnings"].append({
                "code": "METRIC_MISMATCH",
                "detail": f"Recalculated Precision@1 ({recalc_p1:.4f}) differs from reported ({reported.get('precision_at_1')})."
            })

    return report

if __name__ == "__main__":
    res = audit_model8()
    print(json.dumps(res, indent=2))
