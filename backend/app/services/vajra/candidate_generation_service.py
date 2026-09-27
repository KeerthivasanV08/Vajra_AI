"""
Candidate Generation Service Module for VAJRA Platform.
NON-ML candidate generator. Queries available withdrawal nodes and selects Top-20 nearest candidates.
"""

from typing import List, Dict, Any
from app.repositories.node_repository import node_repository
from app.services.vajra.node_vulnerability_service import node_vulnerability_service
from app.utils.geo import haversine_distance_km

class CandidateGenerationService:
    def generate_top20_candidates(
        self,
        predicted_lat: float,
        predicted_lon: float,
        top_k: int = 20
    ) -> List[Dict[str, Any]]:
        """Find the top-K nearest withdrawal nodes to the predicted geographic coordinates."""
        nodes_df = node_repository.get_all_nodes_df()
        if nodes_df.empty:
            return []

        candidates = []
        for _, row in nodes_df.iterrows():
            n_lat = float(row.get("latitude", 0.0))
            n_lon = float(row.get("longitude", 0.0))

            if n_lat == 0.0 and n_lon == 0.0:
                continue

            dist_km = haversine_distance_km(predicted_lat, predicted_lon, n_lat, n_lon)
            rec = row.to_dict()
            rec["candidate_distance_km"] = round(dist_km, 4)

            # Pre-calculate node vulnerability if not present
            if "vulnerability_score_reference" in rec:
                rec["node_vulnerability_score"] = float(rec["vulnerability_score_reference"])
            else:
                rec["node_vulnerability_score"] = node_vulnerability_service.predict_node_vulnerability(rec)

            candidates.append(rec)

        # Sort candidates by distance ascending
        candidates.sort(key=lambda x: x["candidate_distance_km"])
        top_candidates = candidates[:top_k]

        # Assign initial candidate ranking indices
        for i, cand in enumerate(top_candidates):
            cand["candidate_distance_rank"] = i + 1

        return top_candidates

candidate_generation_service = CandidateGenerationService()
