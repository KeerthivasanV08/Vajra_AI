import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app.services.legal.legal_dossier_service import LegalDossierService
from app.schemas.legal import GenerateDossierResponse


class LegalDossierTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.service = LegalDossierService()
        self.service.storage_dir = Path(self.temp_dir.name)
        self.service.storage_dir.mkdir(parents=True, exist_ok=True)
        self.case = {
            "case_id": "CASE_TEST_REAL",
            "source_alert_id": "ALERT_TEST",
            "user_id": "U_TEST_01",
            "transaction_id": "TX_TEST_01",
            "status": "OPEN",
            "priority": "P1",
            "evidence": "{'trans_id': 'TX_TEST_01', 'amount': 5000, 'sender_id': 'U_TEST_01'}",
        }
        self.audit_event = {"event_id": "EVENT_DOSSIER_TEST"}

    def tearDown(self):
        self.temp_dir.cleanup()

    @patch("app.services.legal.legal_dossier_service.case_repository.get_case")
    @patch("app.services.legal.legal_dossier_service.audit_chain_service.append_event")
    def test_generation_persists_pdf_metadata_and_verifies(self, append_event, get_case):
        get_case.return_value = self.case
        append_event.return_value = self.audit_event
        result = self.service.generate_dossier("CASE_TEST_REAL", {}, {}, "OFFICER_TEST")
        self.assertEqual(result["status"], "READY")
        self.assertEqual(result["case_summary"]["evidence"]["trans_id"], "TX_TEST_01")
        self.assertEqual(result["complaint"]["source_alert_id"], "ALERT_TEST")
        self.assertEqual(result["prediction"]["status"], "NOT_LINKED")
        self.assertEqual(result["sop_decision"]["status"], "NOT_LINKED")
        self.assertTrue(result["data_provenance"]["is_synthetic"])
        response = GenerateDossierResponse.model_validate(result)
        self.assertEqual(response.case_summary["case_id"], "CASE_TEST_REAL")
        self.assertEqual(response.complaint["evidence"]["trans_id"], "TX_TEST_01")
        stored = self.service.get_dossier(result["dossier_id"])
        self.assertEqual(stored["case_summary"]["evidence"]["amount"], 5000)
        self.assertTrue(self.service.get_dossier_bytes(result["dossier_id"]))
        verification = self.service.verify_dossier(result["dossier_id"])
        self.assertTrue(verification["verified"])

    @patch("app.services.legal.legal_dossier_service.case_repository.get_case")
    @patch("app.services.legal.legal_dossier_service.audit_chain_service.append_event")
    def test_tampered_pdf_fails_verification(self, append_event, get_case):
        get_case.return_value = self.case
        append_event.return_value = self.audit_event
        result = self.service.generate_dossier("CASE_TEST_REAL", {}, {}, "OFFICER_TEST")
        self.service._pdf_path(result["dossier_id"]).write_bytes(b"tampered")
        self.assertFalse(self.service.verify_dossier(result["dossier_id"])["verified"])

    @patch("app.services.legal.legal_dossier_service.case_repository.get_case", return_value=None)
    def test_unknown_case_is_rejected(self, get_case):
        with self.assertRaises(ValueError):
            self.service.generate_dossier("CASE_UNKNOWN", {}, {}, "OFFICER_TEST")


if __name__ == "__main__":
    unittest.main()