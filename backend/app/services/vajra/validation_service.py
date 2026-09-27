"""
Model Validation Service Module for VAJRA Platform.
Exposes offline evaluation metrics and audit warnings from saved evaluation JSON artifacts.
"""

import json
from typing import Dict, Any, Optional
from app.core.config import settings

class ValidationService:
    def get_model_metrics(self, model_id: str) -> Optional[Dict[str, Any]]:
        file_map = {
            "model1_trajectory": "model1_trajectory_metrics.json",
            "model2_node_vulnerability": "model2_node_vulnerability_metrics.json",
            "model3_spatial_region": "model3_spatial_region_metrics.json",
            "model4_node_ranker": "model4_node_ranking_metrics.json",
            "model5_cross_border": "model5_cross_border_metrics.json",
            "model6_sop_fusion": "model6_sop_fusion_metrics.json",
            "model7_fairness_audit": "model7_fairness_metrics.json",
            "model8_syndicate_matcher": "model8_syndicate_metrics.json"
        }
        fname = file_map.get(model_id)
        if not fname:
            return None

        path = settings.EVALUATION_ROOT / fname
        if path.exists():
            try:
                with open(path, "r") as f:
                    return json.load(f)
            except Exception:
                return None
        return None

    def get_overall_summary(self) -> Dict[str, Any]:
        path = settings.EVALUATION_ROOT / "overall_model_comparison.json"
        if path.exists():
            try:
                with open(path, "r") as f:
                    data = json.load(f)
                # If JSON is a list, wrap it in a dict
                if isinstance(data, list):
                    return {"models": data, "count": len(data)}
                if isinstance(data, dict):
                    return data
            except Exception:
                pass
        # Fallback: return registry summary
        from app.ml.model_registry import model_registry
        registry = model_registry.list_models()
        return {
            "models_count": len(registry),
            "models": {mid: {"model_id": mid, "model_name": info.get("model_name")} for mid, info in registry.items()},
            "data_provenance": "synthetic"
        }

validation_service = ValidationService()
