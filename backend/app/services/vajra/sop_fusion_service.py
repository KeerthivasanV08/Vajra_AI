"""
SOP Fusion Engine & Calibration Service Module for VAJRA Platform.
Implements Model 6 (Weighted Fusion + Isotonic Calibration + Cross-Border Isolation Override).
"""

from typing import Dict, Any, Optional
import numpy as np
from app.ml.model_loader import model_loader
from app.core.config import settings, W_DIGITAL, W_PHYSICAL, W_CONTEXT
from app.core.constants import (
    SOP_TIER_MONITOR, SOP_TIER_SOFT_ALERT, SOP_TIER_RECOMMEND_HOLD,
    SOP_TIER_ESCALATE_FREEZE, SOP_TIER_INTERNATIONAL_OVERRIDE
)

class SOPFusionService:
    def __init__(self):
        self.model_filename = "sop_calibrator.joblib"

    def evaluate_sop(
        self,
        digital_score: float,
        physical_score: float,
        context_score: float = 0.50,
        imminent_overseas_shift: bool = False,
        cross_border_risk_score: float = 0.0
    ) -> Dict[str, Any]:
        """
        Evaluate SOP action tier using standard fusion formula + Isotonic calibration + Isolated cross-border override.
        """
        # 1. Normal Weighted Fusion: 0.45 Digital + 0.35 Physical + 0.20 Context
        raw_fusion_score = float(W_DIGITAL * digital_score + W_PHYSICAL * physical_score + W_CONTEXT * context_score)
        raw_fusion_score = round(float(np.clip(raw_fusion_score, 0.0, 1.0)), 4)

        # 2. Inference-only Isotonic Calibration
        try:
            calibrator = model_loader.load_artifact(self.model_filename)
            calibrated_arr = calibrator.transform([raw_fusion_score])
            calibrated_score = round(float(np.clip(calibrated_arr[0], 0.0, 1.0)), 4)
        except Exception:
            calibrated_score = raw_fusion_score

        # 3. Isolated Cross-Border Override (NOT inside weighted sum!)
        cross_border_override = bool(imminent_overseas_shift or cross_border_risk_score >= 0.70)

        # 4. Map to Operational Action Tier
        if cross_border_override:
            sop_tier = SOP_TIER_INTERNATIONAL_OVERRIDE
            action_description = "TRIGGER INTERNATIONAL RISK OVERRIDE — Flag for Cross-Border Flight Alert & Swift Freeze Coordination"
        elif calibrated_score < 0.50:
            sop_tier = SOP_TIER_MONITOR
            action_description = "PASSIVE MONITORING — Maintain standard telemetry observation"
        elif calibrated_score < 0.70:
            sop_tier = SOP_TIER_SOFT_ALERT
            action_description = "SOFT ALERT — Issue analytical flag for supervisor review"
        elif calibrated_score < 0.85:
            sop_tier = SOP_TIER_RECOMMEND_HOLD
            action_description = "RECOMMEND HOLD — Issue operational recommendation to delay cash-out withdrawal"
        else:
            sop_tier = SOP_TIER_ESCALATE_FREEZE
            action_description = "ESCALATE FREEZE — Recommend immediate account lock & PCR dispatch"

        explanations = []
        if digital_score > 0.65:
            explanations.append(f"High Digital Risk Signal ({digital_score:.2f})")
        if physical_score > 0.65:
            explanations.append(f"High Physical Cash-Out Risk ({physical_score:.2f})")
        if cross_border_override:
            explanations.append("Imminent Overseas Shift Override Triggered")

        return {
            "raw_fusion_score": raw_fusion_score,
            "calibrated_score": calibrated_score,
            "sop_tier": sop_tier,
            "action_description": action_description,
            "cross_border_override": cross_border_override,
            "fusion_weights": {"digital": W_DIGITAL, "physical": W_PHYSICAL, "context": W_CONTEXT},
            "explanations": explanations,
            "legal_authority_disclaimer": "All SOP action tiers are operational recommendations. Seizure, freezing, or arrest requires configured LEA/Bank authorization.",
            "model_version": "Model 6 v1.0 (Weighted Fusion + Isotonic Calibration)"
        }

sop_fusion_service = SOPFusionService()
