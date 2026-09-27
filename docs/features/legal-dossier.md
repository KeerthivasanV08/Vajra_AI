# Feature — Legal Dossier Generator & PDF Compilation

> **Implementation**: `backend/app/services/legal/legal_dossier_service.py` & `pdf_service.py`

---

## 1. Overview & Purpose

The Legal Dossier Generator compiles court-admissible evidence packages summarizing complaint details, ML physical predictions, candidate node rankings, SOP triage decisions, and cryptographic hash verification into a formatted PDF document.

---

## 2. Dossier Compilation Pipeline

```
Raw Complaint + Prediction + SOP Data
                 │
                 ▼
1. Compute SHA-256 Evidence Hash (evidence_service.py)
                 │
                 ▼
2. Compile PDF Document Bytes (pdf_service.py)
                 │
                 ▼
3. Compute Document Binary Hash (evidence_service.py)
                 │
                 ▼
4. Record Block Event in Cryptographic Audit Chain (audit_chain_service.py)
                 │
                 ▼
5. Expose PDF Download Endpoint (/api/v1/legal-dossier/{dossier_id}/pdf)
```

---

## 3. Section Breakdown in PDF Package

- **Section A — Complaint & Initial Detection**: Victim/Mule account ID, transaction amount, digital anomaly score.
- **Section B — Physical Prediction & Candidate Rankings**: Model 1 trajectory, Model 4 Top-3 ranked terminal nodes, vulnerability scores.
- **Section C — Preservation Directives & Legal Notices**: Configurable preservation directives, evidence hash signatures, issuing officer details.

---

## 4. Legal & Operational Boundaries

> **Disclaimer**: Legal dossier generation compiles operational evidence into a standardized layout. It does not independently exercise legal authority; formal submission to law enforcement or judicial bodies requires authorized officer sign-off.
