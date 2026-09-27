import unittest
from fastapi.testclient import TestClient
from main import app

class TestV1Endpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_endpoints(self):
        resp = self.client.get("/api/v1/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get("status"), "ok")

        resp = self.client.get("/api/v1/health/ready")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get("/api/v1/health/models")
        self.assertEqual(resp.status_code, 200)

    def test_02_prediction_cashout(self):
        resp = self.client.post("/api/v1/prediction/cashout", json={
            "account_id": "ACC_TEST_001",
            "geo_lat": 28.6139,
            "geo_lon": 77.2090,
            "digital_risk_score": 0.75,
            "mule_probability": 0.80
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("physical_prediction_score", data)
        self.assertIn("candidates", data)
        self.assertIn("top_candidates", data)

    def test_03_sop_evaluation(self):
        resp = self.client.post("/api/v1/sop/evaluate", json={
            "digital_risk_score": 0.75,
            "physical_prediction_score": 0.68,
            "context_score": 0.50
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("sop_tier", data)
        self.assertIn("calibrated_score", data)

    def test_04_master_vajra_interception(self):
        resp = self.client.post("/api/v1/vajra/analyze", json={
            "account_id": "ACC_TEST_001",
            "geo_lat": 28.6139,
            "geo_lon": 77.2090
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("case_id", data)
        self.assertIn("digital", data)
        self.assertIn("physical", data)
        self.assertIn("sop", data)
        self.assertIn("recommendations", data)
        self.assertIn("audit", data)

    def test_05_nodes_and_corridors(self):
        resp = self.client.get("/api/v1/nodes?page=1&page_size=5")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get("/api/v1/corridors")
        self.assertEqual(resp.status_code, 200)

    def test_06_dispatch_endpoints(self):
        resp = self.client.post("/api/v1/dispatch/pcr", json={
            "case_id": "CASE_UNIT_001",
            "prediction_id": "PRED_TEST_001",
            "target_node_id": "NODE015150",
            "target_lat": 28.6139,
            "target_lon": 77.2090
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn("dispatch_id", resp.json())

        resp = self.client.post("/api/v1/dispatch/bank-stepup", json={
            "account_id": "ACC_UNIT_001",
            "case_id": "CASE_UNIT_001"
        })
        self.assertEqual(resp.status_code, 200)
        self.assertIn("dispatch_id", resp.json())

    def test_07_legal_dossier(self):
        resp = self.client.post("/api/v1/legal-dossier/generate", json={
            "case_id": "CASE_UNIT_001",
            "prediction_data": {
                "predicted_lat": 28.6139,
                "predicted_lon": 77.2090,
                "predicted_cell": "CELL_012",
                "top_candidate": {"node_id": "NODE015150"}
            },
            "sop_data": {
                "sop_tier": "FREEZE_IMMEDIATE",
                "calibrated_score": 0.88
            }
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("dossier_id", data)
        self.assertIn("document_hash", data)

    def test_08_audit_chain(self):
        resp = self.client.get("/api/v1/audit/chain")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post("/api/v1/audit/reverify")
        self.assertEqual(resp.status_code, 200)

    def test_09_fairness_audit(self):
        resp = self.client.get("/api/v1/fairness-audit")
        self.assertEqual(resp.status_code, 200)

        resp = self.client.get("/api/v1/fairness-audit/groups")
        self.assertEqual(resp.status_code, 200)

    def test_10_syndicate_match(self):
        resp = self.client.post("/api/v1/syndicate/match", json={
            "avg_transaction_amount": 85000.0,
            "mule_cluster_size": 4,
            "night_operation_ratio": 0.85,
            "preferred_channel": "ATM_CASH_WITHDRAWAL"
        })
        self.assertEqual(resp.status_code, 200)

    def test_11_live_attack_simulation(self):
        resp = self.client.post("/api/v1/simulation/live-attack", json={
            "victim_account_id": "ACC_VICTIM_001",
            "initial_theft_amount": 500000.0,
            "mule_hops": 3
        })
        self.assertEqual(resp.status_code, 200)

    def test_12_metrics_models(self):
        resp = self.client.get("/api/v1/metrics/models")
        self.assertEqual(resp.status_code, 200)

if __name__ == "__main__":
    unittest.main()
