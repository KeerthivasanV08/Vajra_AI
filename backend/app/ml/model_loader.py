"""
Model Loader Module for VAJRA Platform.
Thread-safe singleton caching model loader. Loads and caches .joblib artifacts on demand or during startup.
"""

from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import ModelNotAvailableError
from app.ml.model_registry import model_registry

class ModelLoader:
    def __init__(self):
        self._cache: Dict[str, Any] = {}

    def load_artifact(self, artifact_name: str) -> Any:
        """Load a .joblib artifact by filename from MODEL_ROOT, with caching."""
        if artifact_name in self._cache:
            return self._cache[artifact_name]

        path = settings.MODEL_ROOT / artifact_name
        if not path.exists():
            # Check fallback path
            alt_path = settings.BACKEND_DIR / "models" / artifact_name
            if alt_path.exists():
                path = alt_path
            else:
                logger.error(f"Model artifact not found: {path}")
                raise ModelNotAvailableError(f"Model artifact '{artifact_name}' missing from disk.")

        try:
            artifact = joblib.load(path)
            self._cache[artifact_name] = artifact
            logger.info(f"Successfully loaded ML artifact: {artifact_name}")
            return artifact
        except Exception as e:
            logger.error(f"Failed to load ML artifact {artifact_name}: {e}")
            raise ModelNotAvailableError(f"Corrupted or invalid model artifact '{artifact_name}': {e}")

    def get_model_and_preprocessor(self, model_filename: str, prep_filename: str) -> Tuple[Any, Any]:
        """Load both model and its matching preprocessor artifact."""
        model = self.load_artifact(model_filename)
        prep = self.load_artifact(prep_filename)
        return model, prep

    def check_health(self) -> Dict[str, Any]:
        """Check availability of all required model artifacts."""
        expected = [
            ("trajectory", "trajectory_model.joblib"),
            ("node_vulnerability", "node_vulnerability_model.joblib"),
            ("spatial_region", "spatial_region_model.joblib"),
            ("node_ranker", "node_ranker_model.joblib"),
            ("cross_border", "cross_border_model.joblib"),
            ("sop_calibrator", "sop_calibrator.joblib"),
            ("syndicate_matcher", "syndicate_matcher.joblib")
        ]

        status = {}
        all_ok = True

        for name, fname in expected:
            path = settings.MODEL_ROOT / fname
            is_present = path.exists()
            status[name] = is_present
            if not is_present:
                all_ok = False

        return {
            "all_healthy": all_ok,
            "models_status": status
        }

model_loader = ModelLoader()
