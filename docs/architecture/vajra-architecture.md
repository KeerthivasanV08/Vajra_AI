# VAJRA AI — System Architecture & Component Design

> **Platform**: VAJRA AI Predictive Cybercrime Cash-Out Interception Platform  
> **Backend Stack**: FastAPI, Python 3.11, Pydantic, Scikit-Learn, XGBoost  
> **Frontend Stack**: React 19, TypeScript 5, Vite, TanStack Router, TanStack Query, Leaflet GIS, TailwindCSS

---

## 1. Executive System Overview

VAJRA AI is an integrated defensive cybercrime intelligence platform designed to predict, track, and intercept physical cash-out fraud. It combines digital anomaly detection with geospatial trajectory modeling, terminal vulnerability scoring, cross-border flight alerts, SOP action fusion, court-admissible legal dossier compilation, and append-only cryptographic audit verification.

```
+-----------------------------------------------------------------------------------+
|                            VAJRA OPERATIONAL CONSOLE                              |
|  (React 19 + TanStack Router + Leaflet GIS + Realtime Threat Feed + Split-Pane UI)  |
+-----------------------------------------┬-----------------------------------------+
                                          │
                                   REST / SSE API
                                          │
+-----------------------------------------▼-----------------------------------------+
|                               FASTAPI BACKEND CORE                                |
|  - Digital Risk Core (/api/*)                                                     |
|  - VAJRA Predictive Interception Layer (/api/v1/*)                                |
+-----------------------------------------┬-----------------------------------------+
                                          │
                                 MASTER ORCHESTRATOR
                                          │
+-----------------------------------------▼-----------------------------------------+
|                              VAJRA MACHINE LEARNING                               |
|  Model 1: IP-Geo Trajectory | Model 2: Node Risk | Model 3: Spatial Region              |
|  Model 4: Node Ranking      | Model 5: Cross-Border | Model 6: SOP Fusion             |
|  Model 7: Fairness Audit    | Model 8: Syndicate Fingerprint                      |
+-----------------------------------------┬-----------------------------------------+
                                          │
                                   PERSISTENCE LAYER
                                          │
+-----------------------------------------▼-----------------------------------------+
|  - Node & Corridor Registry (Spatial Data)                                         |
|  - Append-Only SHA-256 Cryptographic Audit Ledger                                  |
|  - Court Legal Dossier Vault & PDF Generator                                       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Principles

1. **Digital Core + Physical Interception Layer**: The Digital AML Risk Engine provides the initial digital anomaly score ($S_{\text{Digital}}$), which is fed directly into VAJRA's physical trajectory and candidate ranking models.
2. **Split-Pane UX Architecture**: All data-heavy views utilize a 2-pane layout (Left: Search / Filter / Map / List; Right: Persistent Tactical Brief Detail Panel).
3. **Deterministic Cryptographic Audit**: Every dispatch, dossier generation, and prediction appends a SHA-256 block (`SHA256(canonical_event + previous_hash)`) to the append-only ledger.
4. **Isolated Cross-Border Override**: Imminent overseas shifts bypass normal weighted fusion arithmetic, triggering urgent international alerts.
5. **Non-Scoring Governance Isolation**: Model 7 (Fairness Audit) is isolated as an offline governance auditor and cannot alter real-time prediction scores.

---

## 3. Subsystem Breakdown

- **Frontend Application** (`frontend/src`): Built with TanStack Router, Zustand realtime subscriber pattern, TanStack Query server state management, and Leaflet GIS canvas.
- **Backend Application** (`backend/app`): FastAPI application with modular routers, Pydantic schemas, and fallback sanitization (`sanitize_for_json`).
- **ML Engine** (`backend/app/services/vajra` & `backend/models`): Model loading, preprocessing pipelines, and master orchestration (`VajraOrchestrator`).
