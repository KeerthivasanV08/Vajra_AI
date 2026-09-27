"""
Explainability Service Module for VAJRA Platform.
Generates reason codes and feature attribution explanations.
"""

from typing import Dict, Any, List

class ExplainabilityService:
    @staticmethod
    def generate_reason_codes(
        digital_score: float,
        physical_score: float,
        context_score: float,
        cross_border_shift: bool,
        top_node_vulnerability: float,
        trajectory_confidence: float
    ) -> List[str]:
        reason_codes = []
        if digital_score >= 0.70:
            reason_codes.append("HIGH_DIGITAL_RISK_SIGNAL")
        if physical_score >= 0.70:
            reason_codes.append("HIGH_PHYSICAL_CASHOUT_RISK")
        if cross_border_shift:
            reason_codes.append("IMMINENT_OVERSEAS_FLIGHT_RISK")
        if top_node_vulnerability >= 0.75:
            reason_codes.append("HIGH_ATM_NODE_VULNERABILITY")
        if trajectory_confidence >= 0.80:
            reason_codes.append("HIGH_CONFIDENCE_GEO_TRAJECTORY")
        if context_score >= 0.70:
            reason_codes.append("HIGH_ACCOUNT_DRAIN_VELOCITY")

        if not reason_codes:
            reason_codes.append("ROUTINE_MONITORING_PATTERN")

        return reason_codes

explainability_service = ExplainabilityService()
