from __future__ import annotations

import csv
from datetime import datetime, timezone
from typing import Any, Dict, List

from app.core.storage_paths import DATA_DIR
from app.realtime.transaction_memory_store import get_recent_transactions
from app.services.transaction.graph_feature_service import GraphFeatureService
from app.services.vajra.investigation_context_service import get_account_graph_features


def _text(value: Any) -> str:
    return str(value).strip() if value not in (None, "") else ""


def _number(value: Any) -> float | None:
    try:
        return None if value in (None, "") else float(value)
    except (TypeError, ValueError):
        return None


def _first_number(*values: Any) -> float | None:
    for value in values:
        if value not in (None, ""):
            return _number(value)
    return None


def _timestamp(value: Any) -> datetime | None:
    if value in (None, ""):
        return None
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def _seed_transaction_rows() -> List[Dict[str, Any]]:
    seed_path = DATA_DIR / "raw" / "transactions.csv"
    if not seed_path.exists():
        return []
    with seed_path.open("r", encoding="utf-8", newline="") as source:
        return list(csv.DictReader(source))


def _ordered_rows(account_id: str) -> List[Dict[str, Any]]:
    rows = _seed_transaction_rows()
    rows.extend(get_recent_transactions(limit=500, newest_first=False))
    by_id: Dict[str, Dict[str, Any]] = {}
    for index, row in enumerate(rows):
        transaction_id = _text(row.get("trans_id") or row.get("transaction_id"))
        row_key = transaction_id or f"{row.get('sender_id')}:{row.get('receiver_id')}:{row.get('timestamp')}:{index}"
        existing = by_id.get(row_key)
        if existing is None:
            by_id[row_key] = dict(row)
        else:
            for key, value in row.items():
                if existing.get(key) in (None, "") and value not in (None, ""):
                    existing[key] = value
    return sorted(
        [row for row in by_id.values() if _text(row.get("sender_id")) or _text(row.get("receiver_id"))],
        key=lambda row: _timestamp(row.get("timestamp")) or datetime.min.replace(tzinfo=timezone.utc),
    )


def _follow_chain(account_id: str, rows: List[Dict[str, Any]], max_hops: int) -> List[Dict[str, Any]]:
    current = account_id
    chain: List[Dict[str, Any]] = []
    used_ids: set[str] = set()
    previous_time: datetime | None = None

    for _ in range(max_hops):
        candidates = [
            row for row in rows
            if _text(row.get("sender_id")) == current
            and _text(row.get("trans_id")) not in used_ids
            and (
                previous_time is None
                or _timestamp(row.get("timestamp")) is None
                or _timestamp(row.get("timestamp")) >= previous_time
            )
        ]
        if not candidates:
            break
        row = candidates[0]
        trans_id = _text(row.get("trans_id"))
        if trans_id:
            used_ids.add(trans_id)
        receiver = _text(row.get("receiver_id"))
        if not receiver:
            break
        chain.append(row)
        current = receiver
        previous_time = _timestamp(row.get("timestamp"))

    return chain


class MuleRingInvestigationService:
    def investigate(self, account_id: str, max_hops: int = 20) -> Dict[str, Any]:
        normalized_account = _text(account_id)
        graph_service = GraphFeatureService()
        graph_trace = graph_service.get_transfer_chain(normalized_account, max_hops=max_hops)
        rows = _ordered_rows(normalized_account)
        if graph_trace and graph_trace.get("transactions"):
            transactions = graph_trace["transactions"][:max_hops]
            trace_source = "NEO4J"
            graph_status = "AVAILABLE"
        else:
            transactions = _follow_chain(normalized_account, rows, max_hops)
            trace_source = "SYNTHETIC_SEED_LEDGER" if (DATA_DIR / "raw" / "transactions.csv").exists() else "RUNTIME_RECENT_TRANSACTIONS"
            graph_status = "NO_TRANSFER_PATH" if graph_service.neo4j.is_available() else "NEO4J_UNAVAILABLE"

        if not transactions:
            return {
                "account_id": normalized_account,
                "status": "EMPTY",
                "trace_source": trace_source,
                "graph_status": graph_status,
                "case_context": {},
                "hops": [],
                "transactions": [],
                "kpis": {
                    "hops_traced": 0,
                    "fan_out_factor": None,
                    "total_stolen": None,
                    "layering_time_mins": None,
                    "terminal_mules": 0,
                },
            }

        first = transactions[0]
        last = transactions[-1]
        first_time = _timestamp(first.get("timestamp"))
        last_time = _timestamp(last.get("timestamp"))
        elapsed = (last_time - first_time).total_seconds() / 60 if first_time and last_time else None
        receivers_by_sender: Dict[str, set[str]] = {}
        for row in rows:
            sender = _text(row.get("sender_id"))
            receiver = _text(row.get("receiver_id"))
            if sender and receiver:
                receivers_by_sender.setdefault(sender, set()).add(receiver)
        traversed_senders = { _text(row.get("sender_id")) for row in transactions }
        fan_out = max(
            (len(receivers_by_sender.get(sender, set())) for sender in traversed_senders),
            default=0,
        )

        normalized_transactions: List[Dict[str, Any]] = []
        hops: List[Dict[str, Any]] = []
        previous_time = None
        for index, row in enumerate(transactions):
            current_time = _timestamp(row.get("timestamp"))
            elapsed_from_previous = (current_time - previous_time).total_seconds() / 60 if current_time and previous_time else None
            graph_features = get_account_graph_features(_text(row.get("sender_id"))) or {}
            item = {
                "transaction_id": _text(row.get("trans_id")) or None,
                "from_account": _text(row.get("sender_id")) or None,
                "to_account": _text(row.get("receiver_id")) or None,
                "from_bank": _text(row.get("sender_bank") or row.get("from_bank")) or None,
                "to_bank": _text(row.get("receiver_bank") or row.get("to_bank")) or None,
                "amount": _number(row.get("amount")),
                "timestamp": current_time.isoformat() if current_time else None,
                "channel": _text(row.get("channel")) or _text(row.get("payment_mode")) or None,
                "location": _text(row.get("location")) or None,
                "elapsed_mins": elapsed_from_previous,
                "velocity_mins": elapsed_from_previous,
                "latitude": _number(row.get("latitude") or row.get("geo_lat")),
                "longitude": _number(row.get("longitude") or row.get("geo_lon")),
                "graph_score": _first_number(row.get("graph_score"), row.get("neo4j_graph_score"), graph_features.get("graph_score")),
                "final_score": _number(row.get("final_score")),
                "network_risk_score": _number(row.get("network_risk_score")),
                "mule_cluster_flag": _first_number(row.get("mule_cluster_flag"), graph_features.get("mule_cluster_flag")),
                "mule_cluster_size": _first_number(row.get("mule_cluster_size"), graph_features.get("mule_cluster_size")),
                "mule_probability": _number(row.get("mule_probability")),
            }
            normalized_transactions.append(item)
            hops.append({
                "role": "terminal_mule" if index == len(transactions) - 1 else "layer_mule",
                "from_role": "victim" if index == 0 else "layer_mule",
                "step": index + 1,
                "account_id": item["from_account"],
                "bank": None,
                "from_account": item["from_account"],
                "from_bank": _text(row.get("sender_bank") or row.get("from_bank")) or None,
                "to_account": item["to_account"],
                "to_bank": _text(row.get("receiver_bank") or row.get("to_bank")) or None,
                "amount": item["amount"],
                "velocity_min": item["velocity_mins"],
                "elapsed_min": elapsed_from_previous,
                "layer_number": index + 1,
                "timestamp": item["timestamp"],
                "location": item["location"],
                "transaction_id": item["transaction_id"],
            })
            previous_time = current_time

        return {
            "account_id": normalized_account,
            "trace_source": trace_source,
            "graph_status": graph_status,
            "origin": {"account_id": normalized_account, "role": "victim"},
            "status": "SUCCESS",
            "case_context": {},
            "hops": hops,
            "transactions": normalized_transactions,
            "kpis": {
                "hops_traced": len(transactions),
                "fan_out_factor": float(fan_out) if fan_out else None,
                "total_stolen": _number(first.get("amount")),
                "total_flow_value": sum(_number(row.get("amount")) or 0 for row in transactions),
                "layering_time_mins": elapsed,
                "terminal_mules": 1,
            },
        }


mule_ring_investigation_service = MuleRingInvestigationService()
