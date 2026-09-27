import unittest
import pandas as pd
from pathlib import Path
from unittest.mock import patch

from app.core.model_loader import (
    get_model_loader,
    initialize_model_runtime,
    ModelLoaderError,
    behavioral_model,
    onboarding_model,
    sequence_model,
)
from app.services.transaction.ml_behavior_service import MLBehaviorService
from app.services.transaction.sequence_model_service import SequenceModelService
from app.services.onboarding.onboarding_inference_service import OnboardingInferenceService


class TestModelPipelineStrict(unittest.TestCase):
    def test_01_all_models_load_healthy(self):
        """Verify that behavioral, onboarding, and sequence models load as healthy artifacts."""
        loader = get_model_loader()
        snapshot = loader.validate_all(strict=True)

        self.assertEqual(snapshot.get("behavioral_model"), "healthy")
        self.assertEqual(snapshot.get("onboarding_model"), "healthy")
        self.assertEqual(snapshot.get("sequence_model"), "healthy")

    def test_02_behavioral_inference_executes_ml(self):
        """Verify behavioral model inference produces numeric score and top features."""
        service = MLBehaviorService()
        self.assertIsNotNone(service.model, "Behavioral model must be loaded")

        sample_df = pd.DataFrame([{
            "amount": 75000.0,
            "sender_bal_before": 80000.0,
            "sender_bal_after": 5000.0,
            "receiver_bal_after": 75000.0,
            "is_sim_bound": 1,
            "time_to_pay_ms": 1200,
            "amount_deviation": 2.5,
            "balance_depletion_speed": 0.93,
            "counterparty_diversity": 4,
            "distance_from_1L_threshold": 25000.0,
            "distance_from_50k_threshold": 25000.0,
            "drain_ratio": 0.9375,
            "empty_account_flag": 0,
            "forwarding_delay_mins": 2,
            "fragmentation_score": 0.8,
            "is_night_tx": 1,
            "is_round_amount": 0,
            "is_sim_bound_at_tx": 1,
            "near_threshold_flag": 1,
            "rapid_outbound_after_inbound": 1,
            "txn_velocity_1h": 8,
            "identity_trust_score": 0.45,
            "device_trust_score": 0.30,
            "sim_binding_ok": 1,
            "sim_swap_flag": 0,
            "vpn_flag": 1,
            "hosting_flag": 0,
            "city_mismatch_flag": 1,
            "device_age_years": 0.2,
            "graph_score": 0.85,
            "known_fraud_connections": 2,
            "mule_cluster_size": 5,
            "inbound_sources": 3,
            "outbound_dest": 4,
            "rapid_account_cluster_flag": 1,
            "mule_cluster_flag": 1,
            "tx_count_24h": 12,
            "avg_tx_amount_7d": 15000.0,
            "unique_receivers_7d": 6,
            "days_since_last_tx": 0,
            "account_age_days": 15,
            "high_value_txn": 1,
            "rapid_movement": 1,
            "pass_through_ratio": 0.95,
            "structuring_pattern": 1,
            "night_high_value_txn": 1,
            "velocity_risk_score": 0.88,
            "network_risk_score": 0.75,
            "transaction_type": "TRANSFER",
            "channel": "MOBILE_APP",
        }])

        res = service.predict_behavior_risk(sample_df)
        self.assertIn("behavior_score", res)
        self.assertIsInstance(res["behavior_score"], float)
        self.assertGreaterEqual(res["behavior_score"], 0.0)
        self.assertLessEqual(res["behavior_score"], 1.0)
        self.assertIn(res["behavior_label"], ["ALLOW", "REVIEW", "SUSPICIOUS"])

    def test_03_onboarding_inference_executes_ml(self):
        """Verify onboarding model inference produces numeric probability."""
        service = OnboardingInferenceService()
        self.assertIsNotNone(service.model, "Onboarding model must be loaded")

        sample_df = pd.DataFrame([{
            "identity_trust_score": 0.85,
            "device_trust_score": 0.90,
            "sim_binding_ok": 1,
            "sim_swap_flag": 0,
            "sim_age_days": 365,
            "multi_sim_flag": 0,
            "vpn_flag": 0,
            "ip_risk_score": 0.1,
            "device_age_years": 2.0,
            "device_age_days": 730,
            "device_shared_count": 1,
            "root_status": 0,
            "emulator_flag": 0,
            "app_cloner_flag": 0,
            "face_match_score": 0.98,
            "sanction_hit": 0,
            "pep_hit": 0,
            "typing_speed": 45.0,
            "form_completion_time": 120.0,
            "copy_paste_ratio": 0.05,
            "otp_retry_count": 0,
            "identity_trust_score_meta": 0.85,
            "behavioral_confidence": 0.95,
            "vpn_hosting_flag": 0,
            "old_device_flag": 0,
            "network_risk_score": 0.1,
            "sim_risk_score": 0.05,
            "high_copy_paste_flag": 0,
            "otp_abuse_flag": 0,
            "fast_form_submission": 0,
        }])

        res = service.predict_onboarding_risk(sample_df)
        self.assertIn("ml_probability", res)
        self.assertIsInstance(res["ml_probability"], float)
        self.assertIn(res["ml_label"], ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"])

    def test_04_missing_artifact_raises_strict_error(self):
        """Verify that a missing required model artifact triggers a strict startup failure with training instructions."""
        from app.core.model_loader import ModelLoader
        loader = ModelLoader()

        with patch.object(loader, "_load_artifact", side_effect=FileNotFoundError("Mock missing model artifact")):
            with self.assertRaises(ModelLoaderError) as ctx:
                loader.validate_all(strict=True)

            self.assertIn("CRITICAL: Missing required ML model artifacts", str(ctx.exception))
            self.assertIn("Train via:", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
