from __future__ import annotations

import csv
from datetime import datetime, timezone
from functools import lru_cache
from typing import Any, Dict

from app.core.storage_paths import DATA_DIR


def _canonical_user_id(account_id: str) -> str:
    value = str(account_id or "").strip().upper()
    if value.startswith("U") and value[1:].isdigit():
        return f"U{int(value[1:]):06d}"
    return value


def _parse_timestamp(value: Any) -> datetime:
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed.astimezone(timezone.utc)
    except (TypeError, ValueError):
        return datetime.min.replace(tzinfo=timezone.utc)


@lru_cache(maxsize=1)
def _latest_geo_sessions() -> Dict[str, Dict[str, Any]]:
    path = DATA_DIR / "raw" / "spatial" / "ip_geo_sessions.csv"
    if not path.exists():
        return {}

    latest: Dict[str, Dict[str, Any]] = {}
    with path.open("r", encoding="utf-8", newline="") as source:
        for row in csv.DictReader(source):
            user_id = _canonical_user_id(row.get("user_id", ""))
            if not user_id:
                continue
            current = latest.get(user_id)
            if current is None or _parse_timestamp(row.get("session_timestamp")) > _parse_timestamp(current.get("session_timestamp")):
                latest[user_id] = row
    return latest


def get_latest_geo_session(account_id: str) -> Dict[str, Any] | None:
    row = _latest_geo_sessions().get(_canonical_user_id(account_id))
    if not row:
        return None
    try:
        latitude = float(row["geo_lat"])
        longitude = float(row["geo_lon"])
    except (KeyError, TypeError, ValueError):
        return None
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        return None
    return {
        "user_id": row.get("user_id"),
        "session_timestamp": row.get("session_timestamp"),
        "geo_lat": latitude,
        "geo_lon": longitude,
        "previous_geo_lat": float(row["previous_geo_lat"]) if row.get("previous_geo_lat") not in (None, "") else None,
        "previous_geo_lon": float(row["previous_geo_lon"]) if row.get("previous_geo_lon") not in (None, "") else None,
        "vpn_flag": int(float(row.get("vpn_flag") or 0)),
        "proxy_flag": int(float(row.get("proxy_flag") or 0)),
        "tor_flag": int(float(row.get("tor_flag") or 0)),
        "session_sequence_number": int(float(row.get("session_sequence_number") or 1)),
        "time_since_previous_session_sec": float(row.get("time_since_previous_session_sec") or 0),
        "geo_accuracy_km": float(row.get("geo_accuracy_km") or 1),
        "account_age_days": None,
        "device_age_days": None,
        "country": row.get("country"),
        "state": row.get("state"),
        "city": row.get("city"),
    }


@lru_cache(maxsize=4)
def _rows_by_user_id(relative_path: str) -> Dict[str, Dict[str, Any]]:
    path = DATA_DIR / relative_path
    if not path.exists():
        return {}
    with path.open("r", encoding="utf-8", newline="") as source:
        return {
            _canonical_user_id(row.get("user_id", "")): row
            for row in csv.DictReader(source)
            if _canonical_user_id(row.get("user_id", ""))
        }


def get_account_prediction_context(account_id: str) -> Dict[str, Any] | None:
    user_id = _canonical_user_id(account_id)
    user_features = _rows_by_user_id("processed/onboarding/user_features.csv").get(user_id)
    velocity = _rows_by_user_id("processed/transactions/user_velocity.csv").get(user_id)
    profile = _rows_by_user_id("processed/onboarding/users_clean.csv").get(user_id)
    graph_features = _rows_by_user_id("processed/graph_features.csv").get(user_id)
    session = get_latest_geo_session(account_id)
    if not user_features or not velocity or not profile or not session:
        return None

    feature_map = {
        "account_age_days": "account_age_days",
        "device_age_days": "device_age_days",
        "domestic_session_ratio": "domestic_session_ratio",
        "transaction_count": "transaction_count",
        "average_transaction_amount": "average_transaction_amount",
        "total_transaction_amount": "total_transaction_amount",
        "device_shared_count": "device_shared_count",
        "rolling_1h_sum": "rolling_1h_sum",
        "rolling_24h_sum": "rolling_24h_sum",
        "txn_count_1h": "txn_count_1h",
        "txn_count_24h": "txn_count_24h",
        "unique_counterparties_24h": "unique_counterparties_24h",
        "drain_ratio_reference": "drain_ratio_reference",
        "fragmentation_score_reference": "fragmentation_score_reference",
    }
    spatial_features: Dict[str, float] = {}
    for model_column, source_column in feature_map.items():
        source = velocity if source_column in velocity else user_features
        try:
            spatial_features[model_column] = float(source[source_column])
        except (KeyError, TypeError, ValueError):
            return None

    session_time = _parse_timestamp(session.get("session_timestamp"))
    if session_time == datetime.min.replace(tzinfo=timezone.utc):
        return None
    return {
        **session,
        "user_id": user_id,
        "full_name": profile.get("full_name"),
        "graph_features": graph_features,
        "spatial_features": spatial_features,
        "time_of_day": session_time.hour,
        "day_of_week": session_time.weekday(),
    }


def get_account_graph_features(account_id: str) -> Dict[str, Any] | None:
    return _rows_by_user_id("processed/graph_features.csv").get(_canonical_user_id(account_id))
