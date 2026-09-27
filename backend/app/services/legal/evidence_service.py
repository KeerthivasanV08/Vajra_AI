"""
Evidence Hashing Service Module for VAJRA Platform.
Computes canonical SHA-256 evidence hashes for legal dossiers and court evidence preservation.
"""

from typing import Dict, Any
from app.utils.hashing import hash_data, hash_bytes
from app.utils.datetime_utils import now_iso

class EvidenceService:
    def compute_evidence_hash(self, evidence_data: Dict[str, Any]) -> Dict[str, Any]:
        """Compute canonical SHA-256 evidence hash."""
        digest = hash_data(evidence_data, algorithm="sha256")
        return {
            "evidence_hash": digest,
            "algorithm": "sha256",
            "generated_at": now_iso()
        }

    def compute_document_hash(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """Compute SHA-256 hash of generated PDF document."""
        digest = hash_bytes(pdf_bytes, algorithm="sha256")
        return {
            "document_hash": digest,
            "algorithm": "sha256",
            "generated_at": now_iso()
        }

evidence_service = EvidenceService()
