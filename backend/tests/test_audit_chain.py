"""
SHA-256 Audit Chain Smoke Test -- VAJRA Platform.

Run from d:/Vajra_AI/backend:
    python -m pytest tests/test_audit_chain.py -v
"""

from unittest.mock import MagicMock

from app.utils.serialization import canonical_json
from app.utils.hashing import hash_data
from app.utils.datetime_utils import now_iso, parse_datetime
from app.services.audit.audit_chain_service import AuditChainService, GENESIS_PREVIOUS_HASH


def test_canonical_json_deterministic():
    d1 = canonical_json({"b": 2, "a": 1})
    d2 = canonical_json({"a": 1, "b": 2})
    assert d1 == d2
    assert d1 == '{"a":1,"b":2}'


def test_hash_data_deterministic_and_length():
    h1 = hash_data({"b": 2, "a": 1})
    h2 = hash_data({"a": 1, "b": 2})
    assert h1 == h2
    assert len(h1) == 64


def test_now_iso_z_suffix():
    ts = now_iso()
    assert ts.endswith("Z"), f"Expected Z suffix, got: {ts}"
    parsed = parse_datetime(ts)
    assert parsed is not None


def test_append_event_chain_linkage():
    genesis_hash = "a" * 64
    genesis_block = {
        "event_id": "EVENT_GENESIS_00000",
        "timestamp": "2026-01-01T00:00:00Z",
        "officer_id": "SYSTEM_GENESIS",
        "action_type": "GENESIS_BLOCK",
        "target_entity": "SYSTEM",
        "payload_hash": hash_data({"genesis": "VAJRA Cryptographic Audit Chain Initialized"}),
        "previous_hash": GENESIS_PREVIOUS_HASH,
        "event_hash": genesis_hash,
    }
    mock_repo = MagicMock()
    mock_repo.get_all_events.return_value = [genesis_block]
    svc = AuditChainService.__new__(AuditChainService)
    svc.repo = mock_repo
    ev = svc.append_event("TEST_EVENT", "ENTITY_001", {"amount": 5000}, "OFFICER_TEST")
    assert ev["previous_hash"] == genesis_hash
    assert len(ev["event_hash"]) == 64
    assert ev["action_type"] == "TEST_EVENT"
    assert ev["timestamp"].endswith("Z")


def test_verify_chain_detects_tampered_genesis_prev_hash():
    tampered = {
        "event_id": "EVENT_GENESIS_00000",
        "timestamp": "2026-01-01T00:00:00Z",
        "officer_id": "SYSTEM_GENESIS",
        "action_type": "GENESIS_BLOCK",
        "target_entity": "SYSTEM",
        "payload_hash": "somehash",
        "previous_hash": "TAMPERED_NOT_ZEROS",
        "event_hash": "anything",
    }
    mock_repo = MagicMock()
    mock_repo.get_all_events.return_value = [tampered]
    svc = AuditChainService.__new__(AuditChainService)
    svc.repo = mock_repo
    ok, _, bad_id, reason = svc.verify_chain()
    assert not ok
    assert bad_id == "EVENT_GENESIS_00000"
    assert reason is not None


def test_verify_chain_detects_tampered_event_hash():
    captured = []
    mock_repo = MagicMock()
    mock_repo.get_all_events.side_effect = lambda: list(captured)
    mock_repo.append_event.side_effect = lambda e: captured.append(e)
    svc = AuditChainService.__new__(AuditChainService)
    svc.repo = mock_repo
    svc._ensure_genesis()
    svc.append_event("EVENT_A", "ENT_A", {"x": 1}, "OFF_01")
    assert len(captured) == 2
    captured[1]["event_hash"] = "0" * 64
    ok, _, bad_id, reason = svc.verify_chain()
    assert not ok
    assert reason is not None
