"""
Datetime Utilities Module for VAJRA Platform.
Handles timezone-aware UTC datetimes and duration calculations.
"""

from datetime import datetime, timezone
from typing import Optional

def now_utc() -> datetime:
    """Return current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)

def now_iso() -> str:
    """Return ISO-8601 formatted UTC timestamp string with canonical Z suffix."""
    return now_utc().strftime("%Y-%m-%dT%H:%M:%S.%f") + "Z"

def ensure_utc(dt: datetime) -> datetime:
    """Ensure datetime is timezone-aware UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

def parse_datetime(dt_str: str) -> Optional[datetime]:
    """Parse ISO-8601 string to timezone-aware UTC datetime."""
    if not dt_str:
        return None
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        return ensure_utc(dt)
    except Exception:
        return None

def minutes_between(dt1: datetime, dt2: datetime) -> float:
    """Calculate absolute difference in minutes between two datetimes."""
    d1 = ensure_utc(dt1)
    d2 = ensure_utc(dt2)
    diff = abs((d2 - d1).total_seconds())
    return round(diff / 60.0, 2)