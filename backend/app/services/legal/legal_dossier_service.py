"""
Legal Dossier Service Module for VAJRA Platform.
Coordinates structured legal dossier creation, evidence hashing, PDF document compilation, and audit chain recording.
"""

import uuid
from typing import Dict, Any, Optional
from app.services.legal.evidence_service import evidence_service
from app.services.legal.pdf_service import pdf_service
from app.services.audit.audit_chain_service import audit_chain_service
from app.utils.datetime_utils import now_iso
from app.core.constants import DATA_PROVENANCE_SYNTHETIC

class LegalDossierService:
    def __init__(self):
        self._dossiers_store: Dict[str, Dict[str, Any]] = {}

    def generate_dossier(
        self,
        case_id: str,
        prediction_data: Dict[str, Any],
        sop_data: Dict[str, Any],
        officer_id: str = "OFFICER_001_DEFAULT",
        complaint_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate structured legal dossier with evidence hashing and audit recording."""
        dossier_id = f"DOSSIER_{uuid.uuid4().hex[:10].upper()}"
        generated_at = now_iso()

        raw_evidence = {
            "dossier_id": dossier_id,
            "case_id": case_id,
            "prediction_id": prediction_data.get("prediction_id"),
            "account_id": prediction_data.get("account_id"),
            "sop_tier": sop_data.get("sop_tier"),
            "calibrated_score": sop_data.get("calibrated_score"),
            "top_candidate": prediction_data.get("top_prediction", {}),
            "generated_at": generated_at
        }

        # Step 1: Compute SHA-256 evidence hash
        ev_hash_res = evidence_service.compute_evidence_hash(raw_evidence)
        evidence_hash = ev_hash_res["evidence_hash"]

        dossier_payload = {
            "dossier_id": dossier_id,
            "case_id": case_id,
            "generated_at": generated_at,
            "officer_id": officer_id,
            "evidence_hash": evidence_hash,
            "complaint": complaint_data or {"complaint_id": case_id, "amount_inr": 250000.0},
            "prediction": prediction_data,
            "sop_decision": sop_data,
            "data_provenance": DATA_PROVENANCE_SYNTHETIC
        }

        # Step 2: Compile PDF document
        pdf_bytes = pdf_service.generate_dossier_pdf(dossier_payload)

        # Step 3: Compute PDF document hash
        doc_hash_res = evidence_service.compute_document_hash(pdf_bytes)
        document_hash = doc_hash_res["document_hash"]

        # Step 4: Record event in cryptographic audit chain
        audit_event = audit_chain_service.append_event(
            action_type="LEGAL_DOSSIER_GENERATED",
            target_entity=dossier_id,
            payload={"dossier_id": dossier_id, "evidence_hash": evidence_hash, "document_hash": document_hash},
            officer_id=officer_id
        )

        full_record = {
            **dossier_payload,
            "document_hash": document_hash,
            "audit_event_id": audit_event["event_id"],
            "pdf_bytes": pdf_bytes
        }

        self._dossiers_store[dossier_id] = full_record

        return {
            "dossier_id": dossier_id,
            "case_id": case_id,
            "generated_at": generated_at,
            "officer_id": officer_id,
            "evidence_hash": evidence_hash,
            "document_hash": document_hash,
            "audit_event_id": audit_event["event_id"],
            "download_url": f"/api/v1/legal-dossier/{dossier_id}/pdf"
        }

    def get_dossier_bytes(self, dossier_id: str) -> Optional[bytes]:
        rec = self._dossiers_store.get(dossier_id)
        if rec:
            return rec.get("pdf_bytes")
        return None

legal_dossier_service = LegalDossierService()
