"""
Spatial Region Prediction Service Module for VAJRA Platform.
Executes Model 3 (Coarse Multiclass Spatial Region Classifier).
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
from app.ml.model_loader import model_loader

class SpatialPredictionService:
    def __init__(self):
        self.model_filename = "spatial_region_model.joblib"
        self.prep_filename = "spatial_region_preprocessor.joblib"

    def predict_spatial_region(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict coarse geographic region using Model 3."""
        feature_cols = [
            "account_age_days", "device_age_days", "domestic_session_ratio",
            "transaction_count", "average_transaction_amount", "total_transaction_amount",
            "device_shared_count", "rolling_1h_sum", "rolling_24h_sum",
            "txn_count_1h", "txn_count_24h", "unique_counterparties_24h",
            "drain_ratio_reference", "fragmentation_score_reference"
        ]

        try:
            model, prep = model_loader.get_model_and_preprocessor(self.model_filename, self.prep_filename)
            scaler = prep["scaler"]
            le = prep["label_encoder"]
            feature_cols = list(getattr(scaler, "feature_names_in_", feature_cols))

            missing = [column for column in feature_cols if feature_data.get(column) is None]
            if missing:
                raise ValueError(f"Missing observed Model 3 features: {', '.join(missing)}")
            feature_vals = [float(feature_data[column]) for column in feature_cols]

            X_df = pd.DataFrame([feature_vals], columns=feature_cols)
            X_scaled = scaler.transform(X_df)

            probs = model.predict_proba(X_scaled)[0]
            top1_idx = int(np.argmax(probs))
            top3_indices = np.argsort(probs)[-3:][::-1]

            predicted_region = str(le.classes_[top1_idx])
            confidence = round(float(probs[top1_idx]), 4)
            top3 = [{"region": str(le.classes_[idx]), "probability": round(float(probs[idx]), 4)} for idx in top3_indices]

        except Exception as exc:
            raise RuntimeError(f"Model 3 spatial prediction is unavailable: {exc}") from exc

        return {
            "predicted_region": predicted_region,
            "region_confidence": confidence,
            "top3_regions": top3,
            "model_version": "Model 3 v1.0 (XGBoost Region Classifier)"
        }

spatial_prediction_service = SpatialPredictionService()
