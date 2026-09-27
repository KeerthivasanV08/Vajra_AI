"""
Model Registry Module for VAJRA Platform.
Tracks all 8 model definitions, artifact locations, feature schemas, evaluation metrics, and load statuses.
Reads evaluation metadata from backend/evaluation/model_registry.json.
"""

import json
from pathlib import Path
from typing import Dict, Any, Optional
from app.core.config import settings

class ModelRegistry:
    def __init__(self):
        self.registry_file = settings.EVALUATION_ROOT / "model_registry.json"
        self._models_meta: Dict[str, Dict[str, Any]] = {}
        self.refresh_registry()

    def refresh_registry(self) -> None:
        """Load or reload model metadata from evaluation registry JSON."""
        if self.registry_file.exists():
            try:
                with open(self.registry_file, "r") as f:
                    loaded = json.load(f)
                # Registry must be a dict keyed by model_id — reject lists or other types
                self._models_meta = loaded if isinstance(loaded, dict) else {}
            except Exception:
                self._models_meta = {}
        else:
            self._models_meta = {}

        # Default fallback specifications for all 8 models
        default_specs = {
            "model1_trajectory": {
                "model_id": "model1_trajectory",
                "model_name": "Model 1 — Trajectory Model",
                "version": "1.0",
                "artifact_path": str(settings.MODEL_ROOT / "trajectory_model.joblib"),
                "preprocessor_path": str(settings.MODEL_ROOT / "trajectory_preprocessor.joblib"),
                "algorithm": "XGBClassifier (Cell Classification)",
                "audit_warning": "Account ID overlap across chronological split."
            },
            "model2_node_vulnerability": {
                "model_id": "model2_node_vulnerability",
                "model_name": "Model 2 — Node Vulnerability Model",
                "version": "1.0",
                "artifact_path": str(settings.MODEL_ROOT / "node_vulnerability_model.joblib"),
                "preprocessor_path": str(settings.MODEL_ROOT / "node_vulnerability_preprocessor.joblib"),
                "algorithm": "XGBRegressor",
                "audit_warning": "High synthetic target dependency."
            },
            "model3_spatial_region": {
                "model_id": "model3_spatial_region",
                "model_name": "Model 3 — Spatial Region Model",
                "version": "1.0",
                "artifact_path": str(settings.MODEL_ROOT / "spatial_region_model.joblib"),
                "preprocessor_path": str(settings.MODEL_ROOT / "spatial_region_preprocessor.joblib"),
                "algorithm": "XGBClassifier",
                "audit_warning": "Low macro F1 due to large number of regional classes."
            },
            "model4_node_ranker": {
                "model_id": "model4_node_ranker",
                "model_name": "Model 4 — Node-Level Top-K Re-Ranker Model",
                "version": "1.0",
                "artifact_path": str(settings.MODEL_ROOT / "node_ranker_model.joblib"),
                "preprocessor_path": str(settings.MODEL_ROOT / "node_ranker_preprocessor.joblib"),
                "algorithm": "XGBClassifier Ranking",
                "audit_warning": "Candidate distance target proximity requires continued monitoring."
            },
            "model5_cross_border": {
                "model_id": "model5_cross_border",
                "model_name": "Model 5 — Cross-Border Early Warning Model",
                "version": "1.0",
                "artifact_path": str(settings.MODEL_ROOT / "cross_border_model.joblib"),
                "preprocessor_path": str(settings.MODEL_ROOT / "cross_border_preprocessor.joblib"),
                "algorithm": "LogisticRegression",
                "audit_warning": "Rule-derived label dependency."
            },
            "model6_sop_fusion": {
                "model_id": "model6_sop_fusion",
                "model_name": "Model 6 — SOP Fusion Engine & Calibration",
                "version": "1.0",
                "artifact_path": str(settings.MODEL_ROOT / "sop_calibrator.joblib"),
                "preprocessor_path": str(settings.MODEL_ROOT / "sop_preprocessor.joblib"),
                "algorithm": "IsotonicRegression Calibration",
                "audit_warning": "Large calibration improvement requires transparency."
            },
            "model7_fairness_audit": {
                "model_id": "model7_fairness_audit",
                "model_name": "Model 7 — Fairness & Governance Bias Audit",
                "version": "1.0",
                "artifact_path": str(settings.EVALUATION_ROOT / "fairness_audit.json"),
                "algorithm": "Governance Audit Layer",
                "audit_warning": "Non-scoring diagnostic monitoring layer."
            },
            "model8_syndicate_matcher": {
                "model_id": "model8_syndicate_matcher",
                "model_name": "Model 8 — Syndicate Fingerprint Matcher",
                "version": "1.0",
                "artifact_path": str(settings.MODEL_ROOT / "syndicate_matcher.joblib"),
                "algorithm": "CosineSimilarity",
                "audit_warning": "Investigative intelligence similarity tool."
            }
        }

        for mid, spec in default_specs.items():
            if mid not in self._models_meta:
                self._models_meta[mid] = spec
            else:
                self._models_meta[mid].update({
                    "artifact_path": spec["artifact_path"],
                    "audit_warning": spec["audit_warning"]
                })

    def get_model_info(self, model_id: str) -> Optional[Dict[str, Any]]:
        return self._models_meta.get(model_id)

    def list_models(self) -> Dict[str, Dict[str, Any]]:
        return self._models_meta

model_registry = ModelRegistry()
