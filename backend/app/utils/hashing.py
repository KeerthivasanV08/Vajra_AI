"""
Cryptographic Hashing Utilities Module for VAJRA Platform.
Generates SHA-256 hashes for evidence records, audit chain blocks, and legal dossiers.
"""

import hashlib
from typing import Any
from app.utils.serialization import canonical_json

def hash_data(data: Any, algorithm: str = "sha256") -> str:
    """Compute cryptographic hash of canonicalized data structure."""
    canonical_str = canonical_json(data)
    hasher = hashlib.new(algorithm)
    hasher.update(canonical_str.encode("utf-8"))
    return hasher.hexdigest()

def hash_bytes(content: bytes, algorithm: str = "sha256") -> str:
    """Compute cryptographic hash of raw bytes (e.g. PDF documents)."""
    hasher = hashlib.new(algorithm)
    hasher.update(content)
    return hasher.hexdigest()
