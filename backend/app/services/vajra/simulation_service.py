"""
Attack Simulation Service Module for VAJRA Platform.
Simulates end-to-end multi-hop cybercrime cash-out attack pipeline and measures detection/dispatch latencies.
"""

import time
import uuid
from typing import Dict, Any, Optional
from app.services.aml.aml_fusion_service import aml_fusion_service
from app.services.vajra.physical_prediction_service import physical_prediction_service
from app.services.vajra.cross_border_service import cross_border_service
from app.services.vajra.sop_fusion_service import sop_fusion_service
from app.services.operations.dispatch_service import dispatch_service
from app.services.audit.audit_chain_service import audit_chain_service

class SimulationService:
    def run_live_attack_simulation(
        self,
        victim_account_id: str = "ACC_VICTIM_999",
        mule_chain: Optional[list] = None,
        initial_amount_inr: float = 250000.0,
        origin_lat: float = 28.6139,
        origin_lon: float = 77.2090
    ) -> Dict[str, Any]:
        """Execute simulated multi-hop cybercrime attack pipeline."""
        start_time = time.time()
        simulation_id = f"SIM_{uuid.uuid4().hex[:10].upper()}"

        mules = mule_chain or ["ACC_MULE_101", "ACC_MULE_102", "ACC_MULE_103"]

        # Step 1: Digital AML Risk Signal Analysis
        t0 = time.time()
        digital_res = aml_fusion_service.get_digital_risk(account_id=mules[-1])
        digital_latency_ms = round((time.time() - t0) * 1000, 2)

        # Step 2: Physical Prediction (Model 1-4)
        t1 = time.time()
        physical_res = physical_prediction_service.execute_physical_prediction(
            account_id=mules[-1],
            geo_lat=origin_lat,
            geo_lon=origin_lon,
            digital_risk_score=digital_res["digital_risk_score"],
            mule_probability=digital_res["mule_probability"]
        )
        prediction_latency_ms = round((time.time() - t1) * 1000, 2)

        # Step 3: Cross-Border Analysis (Model 5)
        cross_border_res = cross_border_service.predict_cross_border_risk({
            "vpn_usage_ratio_30d": 0.45,
            "foreign_session_count_7d": 1
        })

        # Step 4: SOP Fusion (Model 6)
        sop_res = sop_fusion_service.evaluate_sop(
            digital_score=digital_res["digital_risk_score"],
            physical_score=physical_res["physical_prediction_score"],
            context_score=0.60,
            imminent_overseas_shift=cross_border_res["imminent_overseas_shift"],
            cross_border_risk_score=cross_border_res["cross_border_risk_score"]
        )

        # Step 5: Operational PCR Dispatch Recommendation
        t2 = time.time()
        top_node = physical_res.get("top_prediction", {})
        dispatch_res = dispatch_service.create_pcr_dispatch(
            case_id=simulation_id,
            prediction_id=physical_res["prediction_id"],
            target_node_id=top_node.get("node_id", "NODE_001"),
            target_lat=top_node.get("latitude", origin_lat),
            target_lon=top_node.get("longitude", origin_lon),
            requested_by="SIMULATION_ENGINE"
        )
        dispatch_latency_ms = round((time.time() - t2) * 1000, 2)

        # Step 6: Append Audit Event
        audit_event = audit_chain_service.append_event(
            action_type="SIMULATION_ATTACK_EXECUTED",
            target_entity=simulation_id,
            payload={"simulation_id": simulation_id, "sop_tier": sop_res["sop_tier"]},
            officer_id="SIMULATION_ENGINE"
        )

        total_latency_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "simulation_id": simulation_id,
            "simulation": True,
            "victim_account_id": victim_account_id,
            "mule_chain": mules,
            "initial_amount_inr": initial_amount_inr,
            "digital_analysis": digital_res,
            "physical_prediction": physical_res,
            "cross_border_analysis": cross_border_res,
            "sop_decision": sop_res,
            "dispatch_recommendation": dispatch_res,
            "audit_event": audit_event,
            "performance_metrics": {
                "digital_latency_ms": digital_latency_ms,
                "prediction_latency_ms": prediction_latency_ms,
                "dispatch_latency_ms": dispatch_latency_ms,
                "total_detection_latency_ms": total_latency_ms,
                "estimated_lead_time_minutes": 25.0
            }
        }

simulation_service = SimulationService()
