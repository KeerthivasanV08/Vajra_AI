"""
Master VAJRA Pipeline Orchestrator Module.
Coordinates end-to-end integration:
Digital AML Risk Engine -> Physical Prediction (Model 1-4) -> Cross-Border (Model 5) -> SOP Fusion & Calibration (Model 6) -> Reason Code Explainability -> Operational Dispatch Recommendations -> Cryptographic Audit Chain.
"""

import uuid, math
from typing import Dict, Any, Optional
from app.services.aml.aml_fusion_service import aml_fusion_service
from app.services.vajra.physical_prediction_service import physical_prediction_service
from app.services.vajra.cross_border_service import cross_border_service
from app.services.vajra.sop_fusion_service import sop_fusion_service
from app.services.operations.geofence_service import geofence_service
from app.services.operations.dispatch_service import dispatch_service
from app.services.aml.explainability_service import explainability_service
from app.services.audit.audit_chain_service import audit_chain_service
from app.core.constants import DATA_PROVENANCE_SYNTHETIC

class VajraOrchestrator:
    def run_vajra_case(
        self,
        account_id: str,
        geo_lat: float,
        geo_lon: float,
        session_data: Optional[Dict[str, Any]] = None,
        complaint_context: Optional[Dict[str, Any]] = None,
        officer_id: str = "OFFICER_001_DEFAULT"
    ) -> Dict[str, Any]:
        """Execute complete master VAJRA predictive interception pipeline."""
        case_id = f"CASE_VAJRA_{uuid.uuid4().hex[:10].upper()}"
        session_dict = session_data or {}

        # 1. Digital AML Risk Signal
        digital_res = aml_fusion_service.get_digital_risk(
            account_id=account_id,
            transaction_context=complaint_context
        )

        # 2. VAJRA Physical Prediction Pipeline (Model 1, 3, Candidate Gen, Model 2, 4)
        physical_res = physical_prediction_service.execute_physical_prediction(
            account_id=account_id,
            geo_lat=geo_lat,
            geo_lon=geo_lon,
            digital_risk_score=digital_res["digital_risk_score"],
            mule_probability=digital_res["mule_probability"],
            session_data=session_dict
        )

        # 3. Cross-Border Early Warning (Model 5)
        cross_border_res = cross_border_service.predict_cross_border_risk({
            "vpn_usage_ratio_30d": session_dict.get("vpn_usage_ratio_30d", 0.0),
            "foreign_session_count_7d": session_dict.get("foreign_session_count_7d", 0),
            "foreign_country_count": session_dict.get("foreign_country_count", 0),
            "is_foreign_session": session_dict.get("is_foreign_session", 0)
        })

        # 4. SOP Fusion Engine & Calibration (Model 6)
        sop_res = sop_fusion_service.evaluate_sop(
            digital_score=digital_res["digital_risk_score"],
            physical_score=physical_res["physical_prediction_score"],
            context_score=session_dict.get("context_score", 0.50),
            imminent_overseas_shift=cross_border_res["imminent_overseas_shift"],
            cross_border_risk_score=cross_border_res["cross_border_risk_score"]
        )

        # 5. Explainability Reason Codes
        top_node = physical_res.get("top_prediction", {})
        reasons = explainability_service.generate_reason_codes(
            digital_score=digital_res["digital_risk_score"],
            physical_score=physical_res["physical_prediction_score"],
            context_score=session_dict.get("context_score", 0.50),
            cross_border_shift=cross_border_res["imminent_overseas_shift"],
            top_node_vulnerability=top_node.get("node_vulnerability_score", 0.50),
            trajectory_confidence=physical_res.get("trajectory", {}).get("trajectory_confidence", 0.85)
        )

        # 6. Operational Recommendations & Geofence Unit Lookup
        nearest_lea_unit = geofence_service.find_nearest_lea_unit(
            lat=top_node.get("latitude", geo_lat),
            lon=top_node.get("longitude", geo_lon)
        )

        operational_recommendations = {
            "recommended_sop_tier": sop_res["sop_tier"],
            "action_description": sop_res["action_description"],
            "nearest_lea_unit": nearest_lea_unit,
            "target_cashout_node": top_node,
            "dispatch_pcr_recommended": sop_res["sop_tier"] in ["RECOMMEND_HOLD", "ESCALATE_FREEZE", "INTERNATIONAL_ALERT_OVERRIDE"],
            "bank_stepup_recommended": sop_res["sop_tier"] != "MONITOR"
        }

        # 7. Append Event to Cryptographic Audit Chain
        audit_event = audit_chain_service.append_event(
            action_type="VAJRA_CASE_ANALYZED",
            target_entity=case_id,
            payload={
                "case_id": case_id,
                "account_id": account_id,
                "digital_score": digital_res["digital_risk_score"],
                "physical_score": physical_res["physical_prediction_score"],
                "sop_tier": sop_res["sop_tier"]
            },
            officer_id=officer_id
        )

        return _sanitize({
            "case_id": case_id,
            "account_id": account_id,
            "digital": digital_res,
            "physical": physical_res,
            "cross_border": cross_border_res,
            "sop": sop_res,
            "reason_codes": reasons,
            "recommendations": operational_recommendations,
            "audit": audit_event,
            "data_provenance": DATA_PROVENANCE_SYNTHETIC
        })

import numpy as np

def _sanitize(obj):
    """Recursively replace NaN / Inf floats and convert numpy types so JSON serialization never fails."""
    if obj is None:
        return None
    if isinstance(obj, (float, np.floating)):
        val = float(obj)
        if math.isnan(val) or math.isinf(val):
            return None
        return val
    if isinstance(obj, (int, np.integer)):
        return int(obj)
    if isinstance(obj, np.ndarray):
        return _sanitize(obj.tolist())
    if isinstance(obj, dict):
        return {str(k): _sanitize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [_sanitize(v) for v in obj]
    return obj

vajra_orchestrator = VajraOrchestrator()
