"""
Cross-Border Early Warning Service Module for VAJRA Platform.
Executes Model 5 (LogisticRegression Cross-Border Early Warning Model).
"""

from typing import Dict, Any, Optional
import numpy as np
import pandas as pd
from app.ml.model_loader import model_loader
from app.utils.datetime_utils import now_iso

class CrossBorderService:
    def __init__(self):
        self.model_filename = "cross_border_model.joblib"
        self.prep_filename = "cross_border_preprocessor.joblib"

    def predict_cross_border_risk(self, feature_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict cross-border flight risk and evaluate imminent overseas shift flag."""
        feature_cols = [
            "foreign_session_count_7d", "foreign_session_count_30d", "foreign_country_count",
            "vpn_usage_ratio_30d", "foreign_ip_ratio", "domestic_session_ratio_30d",
            "days_since_onboarding", "hours_since_first_foreign_ip", "country_transition_count", "is_foreign_session"
        ]

        feature_vals = [float(feature_data.get(c, 0.0)) for c in feature_cols]

        try:
            model, scaler = model_loader.get_model_and_preprocessor(self.model_filename, self.prep_filename)
            X_df = pd.DataFrame([feature_vals], columns=feature_cols)
            X_scaled = scaler.transform(X_df)

            prob = float(model.predict_proba(X_scaled)[0, 1])
            risk_score = round(prob, 4)

        except Exception:
            vpn_ratio = float(feature_data.get("vpn_usage_ratio_30d", 0.0))
            foreign_cnt = float(feature_data.get("foreign_session_count_7d", 0.0))
            prob = min(1.0, 0.10 + (0.50 * vpn_ratio) + (0.20 * min(1.0, foreign_cnt / 5.0)))
            risk_score = round(prob, 4)

        # Imminent overseas shift override condition
        imminent_overseas_shift = bool(risk_score >= 0.50 or feature_data.get("vpn_usage_ratio_30d", 0) > 0.6)

        reasons = []
        if feature_data.get("vpn_usage_ratio_30d", 0) > 0.4:
            reasons.append("HIGH_30D_VPN_UTILIZATION")
        if feature_data.get("foreign_session_count_7d", 0) > 1:
            reasons.append("RECENT_FOREIGN_IP_SESSIONS")
        if feature_data.get("country_transition_count", 0) > 2:
            reasons.append("RAPID_CROSS_JURISDICTION_IP_BOUNCE")

        if not reasons:
            reasons.append("DOMESTIC_TRAJECTORY_STABLE")

        return {
            "cross_border_risk_score": risk_score,
            "imminent_overseas_shift": imminent_overseas_shift,
            "foreign_country": feature_data.get("foreign_country", "Unknown"),
            "transition_timestamp": now_iso(),
            "risk_reasons": reasons,
            "model_version": "Model 5 v1.0 (LogisticRegression Early Warning)"
        }

cross_border_service = CrossBorderService()
