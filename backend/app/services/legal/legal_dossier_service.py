"""
Legal Dossier Service Module for VAJRA Platform.
Coordinates structured legal dossier creation, evidence hashing, PDF document compilation, and audit chain recording.
"""

import json
import ast
import uuid
from pathlib import Path
from typing import Dict, Any, Optional
from app.services.legal.evidence_service import evidence_service
from app.services.legal.pdf_service import pdf_service
from app.services.audit.audit_chain_service import audit_chain_service
from app.utils.datetime_utils import now_iso
from app.core.constants import DATA_PROVENANCE_SYNTHETIC
from app.core import storage_paths
from app.services.cases.case_repository import case_repository
from app.services.vajra.sop_fusion_service import sop_fusion_service


def _structured_evidence(value: Any) -> Any:
    if isinstance(value, (dict, list)):
        return value
    if value in (None, ""):
        return {}
    text = str(value)
    for parser in (json.loads, ast.literal_eval):
        try:
            parsed = parser(text)
            if isinstance(parsed, (dict, list)):
                return parsed
            return {"value": parsed}
        except (ValueError, SyntaxError, json.JSONDecodeError):
            continue
    return {"text": text}

class LegalDossierService:
    def __init__(self):
        self.storage_dir = storage_paths.LEGAL_DOSSIERS_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def _metadata_path(self, dossier_id: str) -> Path:
        return self.storage_dir / f"{dossier_id}.json"

    def _pdf_path(self, dossier_id: str) -> Path:
        return self.storage_dir / f"{dossier_id}.pdf"

    def _read_metadata(self, dossier_id: str) -> Dict[str, Any] | None:
        path = self._metadata_path(dossier_id)
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None

    def generate_dossier(
        self,
        case_id: str,
        prediction_data: Dict[str, Any],
        sop_data: Dict[str, Any],
        officer_id: str = "OFFICER_001_DEFAULT",
        complaint_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate structured legal dossier with evidence hashing and audit recording."""
        case = case_repository.get_case(case_id)
        if not case:
            raise ValueError(f"Case '{case_id}' not found")
        case_summary = dict(case)
        case_evidence = _structured_evidence(case.get("evidence"))
        if case_evidence:
            case_summary["evidence"] = case_evidence
        if not complaint_data:
            complaint_data = {
                "case_id": case_id,
                "source_alert_id": case.get("source_alert_id") or None,
                "source_type": case.get("source_type") or None,
                "status": case.get("status") or None,
                "evidence": case_evidence,
            }
        if not prediction_data:
            prediction_data = {
                "status": "NOT_LINKED",
                "reason": "No saved physical prediction is linked to this case.",
            }
        if not sop_data:
            sop_data = sop_fusion_service.case_fusion(case_id) or {
                "status": "NOT_LINKED",
                "reason": "No saved SOP evaluation is linked to this case.",
            }
        data_provenance = {
            **DATA_PROVENANCE_SYNTHETIC,
            "case_source": "case_registry.csv",
            "case_evidence_source": "case_registry.evidence",
            "prediction_status": prediction_data.get("status", "LINKED"),
            "sop_status": sop_data.get("status", "LINKED"),
        }
        existing = self.list_dossiers(case_id=case_id)
        version = max((int(item.get("version", 1)) for item in existing), default=0) + 1
        dossier_id = f"DOSSIER_{case_id}_{version}_{uuid.uuid4().hex[:6].upper()}"
        generated_at = now_iso()

        dossier_payload = {
            "dossier_id": dossier_id,
            "case_id": case_id,
            "prediction_id": prediction_data.get("prediction_id"),
            "account_id": prediction_data.get("account_id"),
            "sop_tier": sop_data.get("sop_tier"),
            "calibrated_score": sop_data.get("calibrated_score"),
            "generated_at": generated_at,
            "case_summary": case_summary,
            "complaint": complaint_data,
            "prediction": prediction_data,
            "sop_decision": sop_data,
            "data_provenance": data_provenance,
        }

        # Step 1: Compute SHA-256 evidence hash
        ev_hash_res = evidence_service.compute_evidence_hash(dossier_payload)
        evidence_hash = ev_hash_res["evidence_hash"]

        dossier_payload["officer_id"] = officer_id
        dossier_payload["evidence_hash"] = evidence_hash

        # Step 2: Compile PDF document
        pdf_bytes = pdf_service.generate_dossier_pdf(dossier_payload)

        # Step 3: Compute PDF document hash
        doc_hash_res = evidence_service.compute_document_hash(pdf_bytes)
        document_hash = doc_hash_res["document_hash"]

        # Step 4: Record event in cryptographic audit chain
        self._pdf_path(dossier_id).write_bytes(pdf_bytes)
        audit_event = audit_chain_service.append_event(
            action_type="LEGAL_DOSSIER_GENERATED",
            target_entity=dossier_id,
            payload={"dossier_id": dossier_id, "evidence_hash": evidence_hash, "document_hash": document_hash},
            officer_id=officer_id
        )

        pdf_path = self._pdf_path(dossier_id)
        try:
            storage_reference = str(pdf_path.relative_to(storage_paths.BACKEND_DIR))
        except ValueError:
            storage_reference = pdf_path.name
        metadata = {**dossier_payload, "version": version, "status": "READY", "integrity_status": "VERIFIED", "document_hash": document_hash, "audit_event_id": audit_event["event_id"], "pdf_path": storage_reference}
        self._metadata_path(dossier_id).write_text(json.dumps(metadata, ensure_ascii=False, indent=2, default=str), encoding="utf-8")

        return {
            "dossier_id": dossier_id,
            "case_id": case_id,
            "generated_at": generated_at,
            "officer_id": officer_id,
            "evidence_hash": evidence_hash,
            "document_hash": document_hash,
            "audit_event_id": audit_event["event_id"],
            "download_url": f"/api/v1/legal-dossier/{dossier_id}/pdf",
            "version": version,
            "status": "READY",
            "integrity_status": "VERIFIED",
            "case_summary": case_summary,
            "complaint": complaint_data,
            "prediction": prediction_data,
            "sop_decision": sop_data,
            "data_provenance": data_provenance,
        }

    def get_dossier_bytes(self, dossier_id: str) -> Optional[bytes]:
        path = self._pdf_path(dossier_id)
        return path.read_bytes() if path.exists() else None

    def get_dossier(self, dossier_id: str) -> Optional[Dict[str, Any]]:
        return self._read_metadata(dossier_id)

    def list_dossiers(self, case_id: str | None = None) -> list[Dict[str, Any]]:
        results = []
        for path in self.storage_dir.glob("DOSSIER_*.json"):
            metadata = self._read_metadata(path.stem)
            if metadata and (not case_id or str(metadata.get("case_id")) == case_id):
                results.append(metadata)
        return sorted(results, key=lambda item: str(item.get("generated_at", "")), reverse=True)

    def verify_dossier(self, dossier_id: str) -> Dict[str, Any]:
        metadata = self.get_dossier(dossier_id)
        pdf_bytes = self.get_dossier_bytes(dossier_id)
        if not metadata or pdf_bytes is None:
            raise KeyError(f"Dossier '{dossier_id}' not found")
        actual = evidence_service.compute_document_hash(pdf_bytes)["document_hash"]
        matches = actual == metadata.get("document_hash")
        return {"dossier_id": dossier_id, "verified": matches, "stored_hash": metadata.get("document_hash"), "actual_hash": actual, "integrity_status": "VERIFIED" if matches else "FAILED"}

legal_dossier_service = LegalDossierService()
