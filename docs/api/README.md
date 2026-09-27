# VAJRA AI — RESTful API Specification Index

> **API Base URL**: `http://127.0.0.1:8000`  
> **API Prefix**: `/api/v1` (VAJRA Predictive Core) & `/api` (Digital AML Risk Core)  
> **OpenAPI Docs**: `http://127.0.0.1:8000/docs`

---

## Endpoint Summary

### 1. Master Prediction & Case Analysis
- `POST /api/v1/vajra/analyze` — Master case predictive interception pipeline.
- `POST /api/v1/prediction/cashout` — Physical cash-out prediction engine.
- `GET /api/v1/prediction/history` — Historical predictions pagination.

### 2. Node & Corridor Management
- `GET /api/v1/nodes` — ATM / AePS / Micro-ATM terminal registry queries.
- `GET /api/v1/corridors` — High-risk cash-out corridor analysis.

### 3. SOP Fusion & Calibration
- `POST /api/v1/sop/evaluate` — SOP fusion calculation & Isotonic calibration.

### 4. Operational Dispatch
- `POST /api/v1/dispatch/pcr` — Police PCR patrol dispatch trigger.
- `POST /api/v1/dispatch/bank-stepup` — Bank step-up authentication trigger.

### 5. Legal Dossiers & Evidence
- `POST /api/v1/legal-dossier/generate` — Compile legal dossier & SHA-256 evidence hash.
- `GET /api/v1/legal-dossier/{dossier_id}/pdf` — Download dossier PDF package.

### 6. Cryptographic Audit Ledger
- `GET /api/v1/audit/chain` — Retrieve append-only audit ledger events.
- `POST /api/v1/audit/reverify` — Execute mathematical chain reverification.

### 7. Governance & Analytics
- `GET /api/v1/fairness-audit` — Regional disparate impact governance report.
- `POST /api/v1/syndicate/match` — Syndicate fingerprint pattern matcher.
- `POST /api/v1/simulation/live-attack` — Adversarial attack simulation runner.
- `GET /api/v1/metrics/models` — ML model registry metrics.
