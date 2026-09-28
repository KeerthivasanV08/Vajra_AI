# VAJRA AI — Predictive Cybercrime Cash-Out Interception Platform

Predictive Cybercrime Intelligence, Cash-Out Forecasting, Risk Fusion, Multi-Hop Investigation, Tactical Dispatch, Compliance Governance and Cryptographic Audit Ledger.

---

## 1. Executive System Overview

**VAJRA AI** is an enterprise-grade defensive cybercrime analytics and predictive interception platform. Built to combat organized financial cybercrime, mule account networks, and rapid physical ATM cash-outs, VAJRA AI bridges the gap between digital fraud detection and physical law enforcement dispatch.

Unlike traditional reactive AML systems that only generate alerts after money has vanished, **VAJRA AI** forecasts physical cash-out locations up to **30 minutes in advance**, enabling proactive police patrol dispatch, bank step-up authentication, court-admissible legal dossier compilation, and tamper-evident audit logging.

```
              Digital AML Risk Engine
          (Onboarding & Transaction Core)
                         │
                         ▼
               VAJRA AI Orchestrator
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     Model 1          Model 2          Model 5
   Trajectory        Node Risk       Cross-Border
        │                │                │
        └────────────────┼────────────────┘
                         ▼
              Spatial Candidate Gen (Top-20)
                         │
                         ▼
               Model 3 Region Classifier
                         │
                         ▼
               Model 4 Node Top-K Re-Ranker
                         │
                      Top-3 Nodes
                         │
                         ▼
               Model 5 Cross-Border Override Check
                         │
        ┌────────────────┴────────────────┐
        │                                 │
  FALSE (Normal)                   TRUE (Override)
        │                                 │
        ▼                                 ▼
   Model 6 Fusion & Calibration    INTERNATIONAL_ALERT_OVERRIDE
   (0.45 Dig + 0.35 Phys + 0.20 Ctx)      │
        │                                 │
        └────────────────┬────────────────┘
                         ▼
                  SOP Action Tier
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   Police / PCR Patrol Dispatch    Bank / SOC Step-Up Auth
        │                                 │
        └────────────────┬────────────────┘
                         ▼
               Court Legal Dossier Vault (PDF)
                         │
                         ▼
           Append-Only Cryptographic Audit Ledger (SHA-256)
```

---

## 2. Platform Capabilities

- **Digital Risk Analysis**: 4-tier digital fusion combining Rules (25%), Behavioral LightGBM (30%), Sequence LSTM (25%), and Graph ML (20%) with decision bands (`>=0.92 BLOCK`, `>=0.70 REVIEW`, `>=0.50 MONITOR`, `<0.50 ALLOW`).
- **IP-to-Geo Trajectory Projection (Model 1)**: Forecasts target geographic coordinates and movement vectors from session telemetry.
- **Terminal Node Vulnerability Scoring (Model 2)**: Evaluates terminal risk across ATMs, Micro-ATMs, AePS CSPs, and POS nodes.
- **Coarse Spatial Region Prediction (Model 3)**: Spatial XGBoost classifier predicting regional cash-out corridors.
- **Top-K Candidate Re-Ranking (Model 4)**: Re-ranks Top-20 spatial candidates to select Top-3 operational cash-out terminals with **99.20% Hit@3 Precision**.
- **Cross-Border Early Warning (Model 5)**: Detects overseas flight risks and executes an **isolated override** bypassing standard weighted fusion sums.
- **SOP Fusion Engine & Isotonic Calibration (Model 6)**: Fuses Digital (45%), Physical (35%), and Contextual (20%) scores, applying Isotonic Calibration to map scores to operational SOP tiers.
- **Fairness & Bias Governance (Model 7)**: Non-scoring diagnostic layer calculating Disparate Impact Ratios (DIR) across 11 regional demographic groups.
- **Syndicate Fingerprint Matcher (Model 8)**: Investigative cosine pattern matcher classifying multi-hop layering tactics (`RAPID_MULE_FANOUT`, etc.).
- **Tactical Dispatch**: Police PCR patrol unit geofence dispatch & Bank SOC step-up authentication.
- **Legal Dossier Vault**: Court-admissible PDF generation with embedded SHA-256 evidence hashing.
- **Cryptographic Audit Ledger**: Tamper-evident append-only SHA-256 block-linked audit log.
- **Beat Officer Field Mode**: PWA touch-optimized interface for mobile patrol officers with live SSE alert streaming.

---

## 3. Machine Learning Architecture Summary

All 8 ML models are verified against holdout datasets in `backend/evaluation/`:

| Model | Purpose | Algorithm | Dataset | Main Metric | Score | Baseline |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Model 1** | IP-Geo Trajectory | RandomForest | `ip_geo_sessions_clean.csv` | Top-1 Accuracy | **95.41%** | 23.52% |
| **Model 2** | Node Vulnerability | XGBRegressor | `node_features.csv` | $R^2$ Score | **0.9987** | 0.1477 (MAE) |
| **Model 3** | Spatial Region | XGBClassifier | `vajra_feature_dataset.csv` | Top-1 Accuracy | **15.76%** | 16.67% |
| **Model 4** | Node Re-Ranker | XGBClassifier | `node_ranking_candidates.csv` | Hit@3 (Precision) | **99.20%** | 0.13% |
| **Model 5** | Cross-Border Warning | LogisticRegression | `cross_border_features.csv` | ROC-AUC | **0.9975** | — |
| **Model 6** | SOP Calibration | Isotonic Fusion | `vajra_feature_dataset.csv` | Brier Score | **0.0001** | 0.2146 (Raw) |
| **Model 7** | Fairness Audit | Equity Auditor | `users_clean.csv` | Mean DIR | **1.0041** | 1.00 |
| **Model 8** | Syndicate Matcher | Cosine Similarity | `syndicate_patterns.csv` | Precision@1 | **14.75%** | — |

Detailed model documentation is available in [**`docs/models/`**](docs/models/).

---

## 4. Repository Structure

```
Vajra_AI/
├── docs/                             # Authoritative Documentation
│   ├── README.md                     # Documentation Index
│   ├── architecture/                 # System & Data Flow Architecture
│   ├── models/                       # Models 1-8 Detailed Specifications
│   ├── features/                     # Candidate Gen, Dossier, Audit, Dispatch
│   ├── workflows/                    # Operational Workflows
│   ├── api/                          # REST & SSE API Reference
│   ├── data/                         # Datasets & Provenance
│   ├── security/                     # Security Architecture & Disclaimers
│   ├── deployment/                   # Frontend/Backend Deployment Guides
│   ├── audit/                        # Independent ML Audit Reports
│   └── images/                       # Model Visualizations & Charts
├── backend/                          # FastAPI Backend Engine
│   ├── app/                          # Core, API Routes, Services, Repositories
│   ├── evaluation/                   # Model Evaluation JSON Metrics & Registry
│   ├── models/                       # Model Artifacts (.joblib)
│   ├── tests/                        # Backend Test Suite (Pytest)
│   ├── main.py                       # Master App Entry Point
│   └── requirements.txt              # Python Dependencies
├── frontend/                         # React 19 + Vite Operational Console
│   ├── src/                          # Routes, Components, Stores, Services
│   ├── public/                       # PWA Manifest & Static Assets
│   └── package.json                  # Node Dependencies
└── data/                             # Raw & Processed Demonstration Datasets
    ├── raw/
    └── processed/
```

---

## 5. Quick Start & Installation Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ / npm 9+
- PowerShell / Bash terminal

### 1. Environment Setup & Dependency Installation
```powershell
# Navigate to repository root
cd d:\Vajra_AI

# Create virtual environment (if not present)
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 2. Model Training & Artifact Generation
> [!IMPORTANT]
> **VAJRA AI strictly requires trained ML model artifacts for runtime operation.** Missing required ML model artifacts will cause startup validation failures rather than silently falling back to heuristics.

Execute the reproducible training scripts to generate all operational model artifacts:

```powershell
cd backend

# 1. Train Onboarding LightGBM Model
python -m training.onboarding.train_onboarding_model

# 2. Train Behavioral LightGBM Model
python -m training.transaction.train_behavioral_model

# 3. Train LSTM Sequence Model
python -m training.transaction.train_sequence_model

# 4. Train Master VAJRA ML Suite (Models 1–8)
python -m training.train_all_models
```

### 3. Model Artifact Validation
Verify that all model artifacts pass health check and self-test verification:
```powershell
cd backend
python verify_complete_pipeline.py
```

### 4. Backend Server Launch
```powershell
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive API Documentation: `http://127.0.0.1:8000/docs`
- Health & Model Readiness Endpoint: `http://127.0.0.1:8000/api/ready`

### 5. Run Test Suite
```powershell
cd backend
python -m unittest tests/test_model_pipeline_strict.py
python -m unittest tests/test_readiness_and_streams.py
```

### 6. Frontend Console Launch
```powershell
cd frontend

# Install Node dependencies
npm install

# Launch Vite development server
npm run dev

# Verify production build
npm run build
```

---

## 6. Deployment

- Deploy the API as a Render Web Service with `backend/` as its root. The build command is `pip install -r requirements.txt`; the start command is `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`. See the [backend deployment summary](backend/README.md#deployment) for required settings.
- Include the trained model artifacts and bundled datasets in the backend release. Startup fails when required model artifacts are missing.
- Set `ENVIRONMENT=production`, a unique secret `JWT_SECRET`, and `FRONTEND_ORIGINS` to the exact deployed frontend origin. Set the frontend build variable `VITE_API_URL` to the deployed API origin.
- Check backend readiness at `/api/v1/health/ready`. Render's default filesystem is ephemeral; CSV-backed audit and runtime records are not durable across restarts or redeploys without persistent storage.
- The current authentication is prototype-only. Keep the service restricted and use synthetic data; do not expose it to real users or sensitive information.
- See the [frontend deployment notes](frontend/README.md#deployment) and [full backend Render guide](docs/deployment/backend-render.md).

## 7. Operational & Legal Disclaimers

1. **Prototype Decision Support**: All SOP action tiers represent decision support recommendations. Seizure, freezing, or arrest requires configured law enforcement or banking human authorization.
2. **Data Provenance**: All demonstration telemetry, withdrawal node coordinates, and transaction chains are labeled with `DATA_PROVENANCE_SYNTHETIC` to prevent confusing prototype demonstrations with live law enforcement telemetry.
3. **Non-Scoring Governance**: Fairness evaluation (Model 7) is an isolated diagnostic governance layer and does not alter real-time decision scores.