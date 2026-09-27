"""
Audit module for evaluation JSON files in backend/evaluation.
"""

import sys
import json
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import EVALUATION_DIR, AUDIT_DIR

def audit_evaluations():
    """
    Perform audit on evaluation metrics JSON files and model registry.
    """
    results = {
        "evaluation_dir": str(EVALUATION_DIR),
        "total_files": 0,
        "valid_json_count": 0,
        "eval_details": []
    }

    expected_eval_files = [
        "model1_trajectory_metrics.json",
        "model2_node_vulnerability_metrics.json",
        "model3_spatial_region_metrics.json",
        "model4_node_ranking_metrics.json",
        "model5_cross_border_metrics.json",
        "model6_sop_fusion_metrics.json",
        "model7_fairness_metrics.json",
        "model8_syndicate_metrics.json",
        "fairness_audit.json",
        "model_registry.json",
        "overall_model_comparison.json"
    ]

    for fname in expected_eval_files:
        path = EVALUATION_DIR / fname
        detail = {
            "filename": fname,
            "path": str(path),
            "exists": path.exists(),
            "valid_json": False,
            "size_bytes": 0,
            "keys_count": 0
        }

        if path.exists():
            results["total_files"] += 1
            detail["size_bytes"] = path.stat().st_size
            try:
                with open(path, "r") as f:
                    data = json.load(f)
                detail["valid_json"] = True
                results["valid_json_count"] += 1
                if isinstance(data, dict):
                    detail["keys_count"] = len(data.keys())
                elif isinstance(data, list):
                    detail["items_count"] = len(data)
            except Exception as e:
                detail["error"] = str(e)
        
        results["eval_details"].append(detail)

    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = AUDIT_DIR / "evaluation_audit.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    return results

if __name__ == "__main__":
    res = audit_evaluations()
    print(json.dumps(res, indent=2))
