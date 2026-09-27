import unittest
from unittest.mock import patch

from app.services.operations.dispatch_service import DispatchService


class FieldDispatchTests(unittest.TestCase):
    def setUp(self):
        self.service = DispatchService.__new__(DispatchService)
        self.service._dispatches = {
            "DISPATCH_TEST": {
                "dispatch_id": "DISPATCH_TEST",
                "case_id": "CASE_TEST",
                "target_node_id": "NODE_TEST",
                "requested_by": "OFFICER_A",
                "field_status": "DISPATCHED",
            }
        }

    def test_wrong_officer_cannot_mutate_dispatch(self):
        with self.assertRaises(PermissionError):
            self.service.assert_officer_assignment("DISPATCH_TEST", "OFFICER_B")

    @patch("app.services.operations.dispatch_service.dispatch_event_repository.append")
    def test_valid_status_transition_is_persisted(self, append):
        result = self.service.update_field_status("DISPATCH_TEST", "OFFICER_A", "EN_ROUTE", idempotency_key="event-1234")
        self.assertEqual(result["field_status"], "EN_ROUTE")
        append.assert_called_once()
        self.assertEqual(append.call_args.args[0]["idempotency_key"], "event-1234")

    @patch("app.services.operations.dispatch_service.dispatch_event_repository.append")
    def test_new_dispatch_contains_persistable_target_and_deadline(self, append):
        record = self.service.create_pcr_dispatch(
            case_id="CASE_TEST",
            prediction_id="PRED_TEST",
            target_node_id="NODE_TEST",
            target_lat=28.6,
            target_lon=77.2,
            requested_by="OFFICER_A",
        )
        self.assertEqual(record["target_coordinates"], {"latitude": 28.6, "longitude": 77.2})
        self.assertTrue(record["deadline"])
        event = append.call_args.args[0]
        self.assertEqual(event["target_lat"], 28.6)
        self.assertEqual(event["target_lon"], 77.2)
        self.assertEqual(event["deadline"], record["deadline"])


if __name__ == "__main__":
    unittest.main()