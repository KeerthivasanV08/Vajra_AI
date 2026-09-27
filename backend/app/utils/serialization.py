"""
Deterministic Serialization Utilities Module for VAJRA Platform.
Ensures stable, sorted JSON strings for cryptographic evidence and audit chain hashing.
"""

import json
from typing import Any

def canonical_json(data: Any) -> str:
    """Serialize Python dict/object to canonical JSON string with sorted keys and uniform separators."""
    return json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=False, default=str)
