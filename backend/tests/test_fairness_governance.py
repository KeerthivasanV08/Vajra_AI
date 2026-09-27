import json
import tempfile
import unittest
from pathlib import Path

from app.services.vajra.fairness_audit_service import FairnessAuditService


class FairnessGovernanceTests(unittest.TestCase):
    def make_service(self, source):
        directory = tempfile.TemporaryDirectory()
        service = FairnessAuditService()
        service.audit_json_path = Path(directory.name) / "fairness.json"
        service.snapshot_path = Path(directory.name) / "snapshot.json"
        service.audit_json_path.write_text(json.dumps(source), encoding="utf-8")
        self.addCleanup(directory.cleanup)
        return service

    def test_rates_and_dir_are_normalized_without_nan(self):
        service = self.make_service([{
            "group": "North",
            "prediction_count": 20,
            "confirmed_case_count": 5,
            "false_positive_count": 2,
            "false_negative_count": 1,
            "predicted_high_risk_rate": 0.25,
            "confirmed_fraud_rate": 0.20,
            "disparate_impact_ratio": 0.75,
        }])
        row = service.recalculate_regions()["results"][0]
        self.assertEqual(row["region_name"], "North")
        self.assertEqual(row["predicted_high_risk_pct"], 25.0)
        self.assertEqual(row["confirmed_fraud_pct"], 20.0)
        self.assertEqual(row["governance_flag"], "REVIEW")
        self.assertNotIn("NaN", json.dumps(row))

    def test_zero_observations_are_insufficient(self):
        service = self.make_service([{
            "group": "Empty",
            "prediction_count": 0,
            "confirmed_case_count": 0,
            "predicted_high_risk_rate": None,
            "confirmed_fraud_rate": None,
            "disparate_impact_ratio": None,
        }])
        row = service.recalculate_regions()["results"][0]
        self.assertIsNone(row["predicted_high_risk_pct"])
        self.assertIsNone(row["confirmed_fraud_pct"])
        self.assertEqual(row["governance_flag"], "N/A")

    def test_snapshot_is_stable_until_recalculation(self):
        service = self.make_service([{
            "group": "Stable",
            "prediction_count": 20,
            "confirmed_case_count": 2,
            "predicted_high_risk_rate": 0.1,
            "confirmed_fraud_rate": 0.1,
            "disparate_impact_ratio": 1.0,
        }])
        created = service.recalculate_regions()["results"][0]["calculated_at"]
        self.assertEqual(service.get_region_rows()[0]["calculated_at"], created)


if __name__ == "__main__":
    unittest.main()