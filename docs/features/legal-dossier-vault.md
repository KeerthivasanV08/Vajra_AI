# Legal Dossier Vault

The Legal Dossier Vault assembles a system-generated investigative evidence package for an existing VAJRA case. It is not a court filing, legal notice, warrant, certification, or claim of automatic legal admissibility.

## Workflow

The frontend selects a real case and calls `POST /api/v1/legal-dossier/generate` with only `case_id`. The backend validates the case through the existing case registry, assembles available case/prediction/SOP context, generates actual PDF bytes with ReportLab, hashes those bytes with SHA-256, appends `LEGAL_DOSSIER_GENERATED` to the existing audit chain, and persists metadata plus PDF bytes under the configured `backend/data/processed/legal_dossiers/` path.

Each generation creates a new versioned dossier ID. Existing versions are not overwritten.

## APIs

- `GET /api/v1/legal-dossiers` lists persisted dossiers, optionally filtered by `case_id`.
- `GET /api/v1/legal-dossiers/{dossier_id}` returns persisted metadata and source context.
- `POST /api/v1/legal-dossier/generate` creates a new case-validated version.
- `GET /api/v1/legal-dossier/{dossier_id}/pdf` downloads the stored PDF bytes.
- `GET /api/v1/legal-dossiers/{dossier_id}/verify` hashes the current stored PDF and compares it to the stored document hash.

## Integrity and provenance

`document_hash` is SHA-256 over the generated PDF bytes. `evidence_hash` is the canonical hash of the source metadata used during assembly. The audit event ID links generation to the shared SHA-256 audit ledger. Hash verification provides cryptographic tamper evidence; it does not establish physical immutability or legal certification.

The dossier distinguishes case/source context from model prediction and SOP context. Missing source sections are reported as unavailable rather than filled with fabricated values.

## Storage and limitations

The prototype uses the centralized backend data path and filesystem storage. Deployment environments with ephemeral filesystems must provide persistent storage or replace this storage adapter. Case-linked alerts, accounts, transactions, graph evidence, officer actions, and model outputs are included only when they are supplied by existing authoritative services; the dossier service does not create a second case or transaction store.