"""
SOP Fusion Engine & Calibration Service Module for VAJRA Platform.
Implements Model 6 (Weighted Fusion + Isotonic Calibration + Cross-Border Isolation Override).
"""

import ast
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import numpy as np
from app.ml.model_loader import model_loader
from app.core.config import settings, W_DIGITAL, W_PHYSICAL, W_CONTEXT
from app.core.constants import (
    SOP_TIER_MONITOR, SOP_TIER_SOFT_ALERT, SOP_TIER_RECOMMEND_HOLD,
    SOP_TIER_ESCALATE_FREEZE, SOP_TIER_INTERNATIONAL_OVERRIDE
)
from app.services.cases.case_repository import case_repository
from app.repositories.sop_fusion_repository import sop_fusion_repository

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

        # 2. Calibration is deliberately withheld until production outcome labels
        # can be joined to SOP fusion records.  The packaged artifact was trained
        # on synthetic targets and must not be represented as a live calibrator.
        calibrated_score = raw_fusion_score
        calibration_trained = False
        calibration_message = "Model not yet trained on linked dispatch outcomes — showing raw score"

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
            "model_version": "Model 6 v1.0 (Weighted Fusion + Isotonic Calibration)",
            "calibration_trained": calibration_trained,
            "calibration_message": calibration_message,
        }

    def simulate(self, digital: float, physical: float, context: float, cross_border_override: bool) -> Dict[str, Any]:
        result = self.evaluate_sop(
            digital_score=digital,
            physical_score=physical,
            context_score=context,
            imminent_overseas_shift=cross_border_override,
        )
        return {
            "raw_score": result["raw_fusion_score"],
            "calibrated_score": result["calibrated_score"],
            "tier": SOP_TIER_ESCALATE_FREEZE if cross_border_override else result["sop_tier"],
            "contributions": {
                "digital": round(W_DIGITAL * digital, 4),
                "physical": round(W_PHYSICAL * physical, 4),
                "context": round(W_CONTEXT * context, 4),
            },
            "cross_border_override": result["cross_border_override"],
            "action_description": result["action_description"],
            "legal_authority_disclaimer": result["legal_authority_disclaimer"],
            "calibration_trained": result["calibration_trained"],
            "calibration_message": result["calibration_message"],
        }

    def case_fusion(self, case_id: str) -> Dict[str, Any] | None:
        # An applied simulation becomes the case's current stored SOP state.
        applied = sop_fusion_repository.latest_for_case(case_id)
        if applied and str(applied.get("calculation_source")) == "applied":
            try:
                result = self.simulate(
                    digital=float(applied["digital_score"]),
                    physical=float(applied["physical_score"]),
                    context=float(applied["context_score"]),
                    cross_border_override=str(applied.get("cross_border_override", "")).lower() in {"true", "1"},
                )
                result["case_id"] = case_id
                result["calculated_at"] = str(applied.get("calculated_at") or datetime.now(timezone.utc).isoformat())
                return result
            except (KeyError, TypeError, ValueError):
                pass
        case = case_repository.get_case(case_id)
        if not case:
            return None
        evidence: Any = case.get("evidence")
        if isinstance(evidence, str):
            try:
                evidence = ast.literal_eval(evidence)
            except (ValueError, SyntaxError):
                evidence = {}
        source = evidence if isinstance(evidence, dict) else case
        required = ("digital_risk_score", "physical_prediction_score", "context_score")
        if not all(key in source for key in required):
            return None
        result = self.simulate(
            digital=float(source["digital_risk_score"]),
            physical=float(source["physical_prediction_score"]),
            context=float(source["context_score"]),
            cross_border_override=bool(source.get("cross_border_override", False)),
        )
        result["case_id"] = case_id
        result["calculated_at"] = datetime.now(timezone.utc).isoformat()
        return result

sop_fusion_service = SOPFusionService()
