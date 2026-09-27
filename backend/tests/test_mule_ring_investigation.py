import unittest
from unittest.mock import patch

from app.services.vajra.mule_ring_investigation_service import MuleRingInvestigationService


class MuleRingInvestigationTests(unittest.TestCase):
    @patch("app.services.vajra.mule_ring_investigation_service.get_recent_transactions")
    def test_empty_account_is_explicit(self, recent):
        recent.return_value = []
        with patch("app.services.vajra.mule_ring_investigation_service._seed_transaction_rows", return_value=[]):
            result = MuleRingInvestigationService().investigate("ACC_EMPTY")
        self.assertEqual(result["status"], "EMPTY")
        self.assertEqual(result["kpis"]["hops_traced"], 0)
        self.assertEqual(result["transactions"], [])

    @patch("app.services.vajra.mule_ring_investigation_service.get_recent_transactions")
    def test_hops_follow_real_sender_receiver_chain(self, recent):
        recent.return_value = [
            {"trans_id": "T1", "sender_id": "A", "receiver_id": "B", "amount": 100, "timestamp": "2026-01-01T00:00:00Z"},
            {"trans_id": "T2", "sender_id": "B", "receiver_id": "C", "amount": 80, "timestamp": "2026-01-01T00:05:00Z"},
        ]
        with patch("app.services.vajra.mule_ring_investigation_service._seed_transaction_rows", return_value=[]):
            result = MuleRingInvestigationService().investigate("A")
        self.assertEqual(result["status"], "SUCCESS")
        self.assertEqual(result["kpis"]["hops_traced"], 2)
        self.assertEqual([hop["account_id"] for hop in result["hops"]], ["A", "B"])
        self.assertEqual(result["kpis"]["layering_time_mins"], 5.0)

    @patch("app.services.vajra.mule_ring_investigation_service._seed_transaction_rows", return_value=[])
    @patch("app.services.vajra.mule_ring_investigation_service.get_recent_transactions")
    def test_flow_connectors_have_complete_chains_at_supported_depths(self, recent, _seed):
        for hop_count in (3, 4, 6):
            recent.return_value = [
                {
                    "trans_id": f"T{hop}",
                    "sender_id": "A" if hop == 1 else chr(64 + hop),
                    "receiver_id": chr(65 + hop),
                    "amount": 100 - hop,
                    "timestamp": f"2026-01-01T00:{hop * 5:02d}:00Z",
                }
                for hop in range(1, hop_count + 1)
            ]
            result = MuleRingInvestigationService().investigate("A", max_hops=20)
            self.assertEqual(result["kpis"]["hops_traced"], hop_count)
            self.assertEqual(result["hops"][-1]["role"], "terminal_mule")
            self.assertTrue(all((hop["elapsed_min"] or 0) >= 0 for hop in result["hops"]))


if __name__ == "__main__":
    unittest.main()