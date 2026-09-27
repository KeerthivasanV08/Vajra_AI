"""
Node Ranking Service Module for VAJRA Platform.
Executes Model 4 (XGBClassifier Top-K Candidate Re-Ranker) to select Top-3 cash-out nodes.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from app.ml.model_loader import model_loader

class NodeRankingService:
    def __init__(self):
        self.model_filename = "node_ranker_model.joblib"
        self.prep_filename = "node_ranker_preprocessor.joblib"

    def rank_candidates(
        self,
        candidates: List[Dict[str, Any]],
        trajectory_confidence: float = 0.85,
        digital_risk_score: float = 0.70,
        mule_probability: float = 0.65
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """Rank candidates using Model 4 and return (all_ranked_candidates, top3_candidates)."""
        if not candidates:
            return [], []

        feature_cols = [
            "candidate_distance_km", "node_vulnerability_score", "fraud_density_5km",
            "historical_cashout_rate", "trajectory_confidence", "digital_risk_score",
            "mule_probability", "time_of_day", "day_of_week"
        ]

        try:
            model, scaler = model_loader.get_model_and_preprocessor(self.model_filename, self.prep_filename)

            feature_rows = []
            for c in candidates:
                row_vals = [
                    float(c.get("candidate_distance_km", 1.0)),
                    float(c.get("node_vulnerability_score", 0.5)),
                    float(c.get("local_5km_fraud_density", c.get("fraud_density_5km", 2.0))),
                    float(c.get("historical_cashout_rate", c.get("historical_cashout_ratio", 0.5))),
                    float(trajectory_confidence),
                    float(digital_risk_score),
                    float(mule_probability),
                    14, # time of day (14:00 default)
                    3   # day of week (Wednesday default)
                ]
                feature_rows.append(row_vals)

            X_df = pd.DataFrame(feature_rows, columns=feature_cols)
            X_scaled = scaler.transform(X_df)
            scores = model.predict_proba(X_scaled)[:, 1]

            for i, c in enumerate(candidates):
                c["ranker_score"] = round(float(scores[i]), 4)

        except Exception:
            # Fallback ranking combined score: distance weight 0.5 + vulnerability weight 0.5
            for c in candidates:
                dist = c.get("candidate_distance_km", 1.0)
                vuln = c.get("node_vulnerability_score", 0.5)
                combined = (0.60 * (1.0 / (1.0 + dist))) + (0.40 * vuln)
                c["ranker_score"] = round(float(combined), 4)

        # Sort candidates by Model 4 ranker_score descending
        ranked = sorted(candidates, key=lambda x: x["ranker_score"], reverse=True)

        for i, c in enumerate(ranked):
            c["final_rank"] = i + 1

        top3 = ranked[:3]
        return ranked, top3

from typing import Tuple
node_ranking_service = NodeRankingService()
