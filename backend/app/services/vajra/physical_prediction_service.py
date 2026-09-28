"""
Physical Prediction Orchestrator Service Module for VAJRA Platform.
Coordinates Trajectory (Model 1), Spatial Region (Model 3), Candidate Generation, Node Vulnerability (Model 2), and Node Re-Ranker (Model 4).
"""

import uuid
from typing import Dict, Any, Optional, List
from app.services.vajra.trajectory_service import trajectory_service
from app.services.vajra.spatial_prediction_service import spatial_prediction_service
from app.services.vajra.candidate_generation_service import candidate_generation_service
from app.services.vajra.node_vulnerability_service import node_vulnerability_service
from app.services.vajra.node_ranking_service import node_ranking_service
from app.repositories.prediction_repository import prediction_repository
from app.core.constants import DATA_PROVENANCE_SYNTHETIC
from app.core.exceptions import InvalidPredictionInputError

class PhysicalPredictionService:
    def execute_physical_prediction(
        self,
        account_id: str,
        geo_lat: float,
        geo_lon: float,
        digital_risk_score: float = 0.70,
        mule_probability: float = 0.65,
        session_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute complete physical predictive cash-out interception pipeline."""
        prediction_id = f"PRED_{uuid.uuid4().hex[:12].upper()}"

        # 1. Model 1 Trajectory prediction
        session_dict = session_data or {}
        previous_lat = session_dict.get("previous_geo_lat", session_dict.get("prev_lat"))
        previous_lon = session_dict.get("previous_geo_lon", session_dict.get("prev_lon"))
        previous_time = session_dict.get(
            "time_since_previous_session_sec",
            session_dict.get("time_since_previous_sec"),
        )
        geo_accuracy = session_dict.get("geo_accuracy_km")
        if any(value is None for value in (previous_lat, previous_lon, previous_time, geo_accuracy)):
            raise InvalidPredictionInputError(
                "Observed prior-session coordinates, elapsed time, and geo accuracy are required."
            )

        trajectory_res = trajectory_service.predict_trajectory(
            account_id=account_id,
            geo_lat=geo_lat,
            geo_lon=geo_lon,
            prev_lat=previous_lat,
            prev_lon=previous_lon,
            vpn_flag=session_dict.get("vpn_flag", 0),
            proxy_flag=session_dict.get("proxy_flag", 0),
            tor_flag=session_dict.get("tor_flag", 0),
            session_sequence_number=session_dict.get("session_sequence_number", 1),
            time_since_previous_sec=previous_time,
            geo_accuracy_km=geo_accuracy,
        )

        pred_lat = trajectory_res["predicted_lat"]
        pred_lon = trajectory_res["predicted_lon"]
        traj_conf = trajectory_res["trajectory_confidence"]

        # 2. Model 3 Spatial Region prediction
        spatial_context = session_dict.get("spatial_features", {})
        if not isinstance(spatial_context, dict):
            spatial_context = {}
        spatial_features = {
            feature: spatial_context.get(feature, session_dict.get(feature))
            for feature in (
                "account_age_days",
                "device_age_days",
                "domestic_session_ratio",
                "transaction_count",
                "average_transaction_amount",
                "total_transaction_amount",
                "device_shared_count",
                "rolling_1h_sum",
                "rolling_24h_sum",
                "txn_count_1h",
                "txn_count_24h",
                "unique_counterparties_24h",
                "drain_ratio_reference",
                "fragmentation_score_reference",
            )
        }
        region_res = spatial_prediction_service.predict_spatial_region(spatial_features)

        # 3. Non-ML Top-20 Candidate Generation
        candidates = candidate_generation_service.generate_top20_candidates(
            predicted_lat=pred_lat,
            predicted_lon=pred_lon,
            top_k=20
        )

        # 4. Model 4 Top-K Candidate Re-Ranking
        all_ranked, top3_candidates = node_ranking_service.rank_candidates(
            candidates=candidates,
            trajectory_confidence=traj_conf,
            digital_risk_score=digital_risk_score,
            mule_probability=mule_probability
        )

        # 5. Extract top physical prediction output
        top_pred_node = top3_candidates[0] if top3_candidates else {}
        top_ranker_score = top_pred_node.get("ranker_score", 0.50)
        top_vuln_score = top_pred_node.get("node_vulnerability_score", 0.50)

        # Physical Prediction Score formula: 0.50 ranker_score + 0.30 traj_conf + 0.20 node_vuln
        physical_prediction_score = round(float(0.50 * top_ranker_score + 0.30 * traj_conf + 0.20 * top_vuln_score), 4)

        result = {
            "prediction_id": prediction_id,
            "account_id": account_id,
            "predicted_region": region_res["predicted_region"],
            "region_confidence": region_res["region_confidence"],
            "trajectory": trajectory_res,
            "candidates_count": len(all_ranked),
            "candidates": all_ranked,
            "top_candidates": top3_candidates,
            "top_prediction": top_pred_node,
            "physical_prediction_score": physical_prediction_score,
            "predicted_time_window_mins": 30,
            "data_provenance": DATA_PROVENANCE_SYNTHETIC,
            "model_versions": {
                "trajectory": "Model 1 v1.0",
                "node_vulnerability": "Model 2 v1.0",
                "spatial_region": "Model 3 v1.0",
                "node_ranker": "Model 4 v1.0"
            }
        }

        # Store prediction in repository
        prediction_repository.save_prediction(result)
        return result

physical_prediction_service = PhysicalPredictionService()
