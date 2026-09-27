# VAJRA AI — Technical Documentation Index

Welcome to the comprehensive technical documentation for **VAJRA AI: Predictive Cybercrime Intelligence, Cash-Out Forecasting, Risk Fusion, Investigation, Dispatch, Compliance and Audit Platform**.

---

## Documentation Structure

### 1. Architecture & System Overview
- [**System Architecture**](architecture/vajra-architecture.md) — High-level architecture, component interaction, and design patterns.
- [**Data Flow Architecture**](architecture/data-flow.md) — End-to-end data pipeline from digital transaction signal to physical patrol dispatch and cryptographic audit.
- [**System Components**](architecture/system-components.md) — Detailed breakdown of frontend, backend, ML engines, and storage layers.

---

## 2. Machine Learning & Predictive Models
- [**Overall Model Pipeline & Flow**](models/overall-model-flow.md) — Master A-Z model execution flow connecting Models 1 through 8.
- [**Model 1 — IP-to-Geo Trajectory Prediction**](models/model-01-ip-geo-trajectory.md) — Sequential trajectory projection & movement modeling.
- [**Model 2 — Node Vulnerability Model**](models/model-02-node-vulnerability.md) — ATM / AePS terminal risk scoring using XGBoost.
- [**Model 3 — Spatial Region Prediction**](models/model-03-spatial-cashout-region.md) — Coarse regional cash-out spatial forecasting.
- [**Model 4 — Node-Level Top-K Re-Ranker**](models/model-04-node-ranking.md) — XGBoost candidate terminal re-ranking.
- [**Model 5 — Cross-Border Early Warning**](models/model-05-cross-border-detection.md) — Overseas flight & international risk isolation override.
- [**Model 6 — SOP Fusion Engine & Calibration**](models/model-06-sop-fusion-calibration.md) — Isotonic regression fusion & operational SOP tiering.
- [**Model 7 — Fairness & Governance Bias Audit**](models/model-07-fairness-audit.md) — Non-scoring regional disparate impact governance auditor.
- [**Model 8 — Syndicate Fingerprint Matcher**](models/model-08-syndicate-fingerprint.md) — Cosine similarity pattern matcher for investigative ring analysis.

---

## 3. Platform Capabilities & Features
- [**Non-ML Candidate Generation**](features/candidate-generation.md) — Spatial query & Haversine candidate shortlist generation.
- [**Node Registry & Management**](features/node-registry.md) — Terminal node risk profiling & tactical briefs.
- [**Mule Ring Hop-by-Hop Investigator**](features/mule-ring-investigation.md) — Multi-hop transaction velocity & syndicate matching.
- [**PCR & Bank Dispatch Engine**](features/dispatch-geofencing.md) — Police patrol unit geofencing & bank step-up auth dispatch.
- [**Legal Dossier Generator**](features/legal-dossier.md) — Court-admissible evidence compilation & PDF generation.
- [**Cryptographic Audit Ledger**](features/audit-chain.md) — Tamper-evident SHA-256 block-linked audit chain.
- [**Adversarial Simulation Engine**](features/simulation-engine.md) — Real-time fraud scenario & attack simulation.
- [**Realtime Event Streamer**](features/realtime-events.md) — SSE-driven transaction & alert streaming architecture.

---

## 4. Operational Workflows
- [**Predictive Cash-Out Interception**](workflows/predictive-interception.md) — End-to-end detection & dispatch flow.
- [**Officer Case Investigation**](workflows/officer-investigation.md) — Analyst triage, freeze requests, and SAR generation.
- [**Node Tactical Operations**](workflows/node-investigation.md) — Terminal vulnerability inspection & PCR patrol dispatch.
- [**Compliance & Equity Review**](workflows/compliance-review.md) — Regional disparate impact governance auditing.
- [**Legal Dossier Compilation**](workflows/legal-dossier-workflow.md) — Evidence packaging & PDF download.
- [**Audit Reverification**](workflows/audit-verification.md) — Mathematical chain integrity validation.
- [**Adversarial Simulation Run**](workflows/simulation-workflow.md) — Synthetic attack scenario execution.

---

## 5. API Contracts & References
- [**API Overview & Index**](api/README.md) — RESTful API structure, authentication, and standard responses.
- [**Predictions API**](api/predictions.md) — Endpoints for `/api/v1/prediction/cashout` and `/api/v1/vajra/analyze`.
- [**Node Management API**](api/nodes.md) — Node queries and corridor intelligence (`/api/v1/nodes`, `/api/v1/corridors`).
- [**Alert Center API**](api/alerts.md) — Alert retrieval, queue management, freeze requests, and SAR filings.
- [**SOP Evaluation API**](api/sop.md) — SOP fusion calculation (`/api/v1/sop/evaluate`).
- [**Dispatch API**](api/dispatch.md) — PCR patrol and bank step-up dispatch triggers.
- [**Legal Dossier API**](api/dossiers.md) — Dossier compilation and PDF export (`/api/v1/legal-dossier/*`).
- [**Audit Chain API**](api/audit.md) — Audit chain retrieval and reverification (`/api/v1/audit/*`).
- [**Fairness Audit API**](api/fairness.md) — Governance fairness metrics (`/api/v1/fairness-audit`).
- [**Realtime SSE API**](api/realtime.md) — Server-sent event streams for live transactions and alerts.

---

## 6. Data, Security & Deployment
- [**Dataset Schemas & Provenance**](data/datasets.md) — Feature definitions, synthetic datasets, and data provenance.
- [**Security Architecture**](security/security-architecture.md) — RBAC, cryptographic hashing, and artifact protection.
- [**Operational & Legal Boundaries**](security/operational-and-legal-boundaries.md) — Disclaimers on prototype decision tiers & legal authority boundaries.
- [**Frontend Deployment Guide**](deployment/frontend.md) — Vite SPA / SSR deployment & configuration.
- [**Backend Deployment Guide**](deployment/backend.md) — FastAPI / Uvicorn server configuration & environment settings.
- [**Production Checklist**](deployment/production-checklist.md) — Pre-deployment verification criteria.

---

## 7. Model Audit Reports
- [**ML Audit Summary**](audit/README.md) — Independent evaluation reports, dataset audits, and leakage checks.
