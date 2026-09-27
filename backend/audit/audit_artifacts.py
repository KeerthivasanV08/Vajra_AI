"""
Audit module for model artifacts in backend/models.
"""

import sys
import json
import os
from pathlib import Path
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config.config import MODELS_DIR, AUDIT_DIR

def audit_artifacts():
    """
    Perform audit on all model and preprocessor artifacts in backend/models.
    """
    results = {
        "models_dir": str(MODELS_DIR),
        "total_artifacts": 0,
        "valid_artifacts": 0,
        "corrupted_artifacts": 0,
        "artifact_details": []
    }

    expected_artifacts = [
        "trajectory_model.joblib", "trajectory_preprocessor.joblib",
        "node_vulnerability_model.joblib", "node_vulnerability_preprocessor.joblib",
        "spatial_region_model.joblib", "spatial_region_preprocessor.joblib",
        "node_ranker_model.joblib", "node_ranker_preprocessor.joblib",
        "cross_border_model.joblib", "cross_border_preprocessor.joblib",
        "sop_calibrator.joblib", "sop_preprocessor.joblib",
        "syndicate_matcher.joblib"
    ]

    for artifact_name in expected_artifacts:
        path = MODELS_DIR / artifact_name
        detail = {
            "filename": artifact_name,
            "path": str(path),
            "exists": path.exists(),
            "size_bytes": 0,
            "readable": False,
            "type_name": "unknown",
            "status": "MISSING"
        }

        if path.exists():
            results["total_artifacts"] += 1
            detail["size_bytes"] = path.stat().st_size
            try:
                obj = joblib.load(path)
                detail["readable"] = True
                detail["type_name"] = type(obj).__name__
                detail["status"] = "VALID"
                results["valid_artifacts"] += 1
            except Exception as e:
                detail["readable"] = False
                detail["error"] = str(e)
                detail["status"] = "CORRUPTED"
                results["corrupted_artifacts"] += 1
        else:
            detail["status"] = "MISSING"

        results["artifact_details"].append(detail)

    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = AUDIT_DIR / "artifact_audit.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    return results

if __name__ == "__main__":
    res = audit_artifacts()
    print(json.dumps(res, indent=2))
