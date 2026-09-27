# VAJRA AI — FastAPI Backend Core

> Predictive Cybercrime Intelligence, Physical Cash-Out Forecasting, Risk Fusion, Tactical Dispatch, Legal Dossier Engine, and Cryptographic Audit Ledger.

The backend is an enterprise-grade predictive interception engine built with FastAPI, Scikit-Learn, XGBoost, and PyTorch/TensorFlow. It integrates the Digital AML Risk Core with VAJRA's physical cash-out prediction pipeline (Models 1–8).

---

## 1. System Architecture

```
FastAPI Routers (/api/v1/* & /api/*)
        │
        ▼
Master Orchestrator (app/services/vajra/vajra_orchestrator.py)
        │
        ├── Model 1: IP-to-Geo Trajectory (RandomForest)
        ├── Spatial Candidate Generator (Non-ML Haversine Shortlist)
        ├── Model 2: Node Vulnerability (XGBRegressor)
        ├── Model 3: Spatial Region Classifier (XGBClassifier)
        ├── Model 4: Top-K Node Re-Ranker (XGBClassifier)
        ├── Model 5: Cross-Border Early Warning (Isolated Override)
        ├── Model 6: SOP Fusion Engine & Calibration (Isotonic Regression)
        ├── Model 7: Fairness Audit (Non-Scoring Governance Layer)
        └── Model 8: Syndicate Fingerprint Matcher (Cosine Similarity)
        │
        ▼
Operational Service Engines
        ├── Geofence & Dispatch Service (PCR Patrol & Bank Step-Up)
        ├── Legal Dossier Vault & PDF Generator (SHA-256 Hashing)
        └── Append-Only Cryptographic Audit Ledger (SHA-256 Block-Linked)
```

---

## 2. API Routes Summary

- **`/api/v1/vajra/analyze`**: Master case analysis orchestrator.
- **`/api/v1/prediction/cashout`**: Physical cash-out prediction pipeline.
- **`/api/v1/sop/evaluate`**: SOP fusion formula & Isotonic calibration.
- **`/api/v1/nodes`**: Terminal node registry queries (ATMs, Micro-ATMs, AePS).
- **`/api/v1/corridors`**: High-risk withdrawal corridor analysis.
- **`/api/v1/dispatch/pcr`**: PCR patrol dispatch triggers.
- **`/api/v1/dispatch/bank-stepup`**: Bank step-up authentication triggers.
- **`/api/v1/legal-dossier/generate`**: Court legal dossier PDF generation.
- **`/api/v1/audit/chain`**: SHA-256 block-linked audit ledger.
- **`/api/v1/audit/reverify`**: Cryptographic chain reverification.
- **`/api/v1/fairness-audit`**: Non-scoring regional disparate impact report.
- **`/api/v1/syndicate/match`**: Syndicate fingerprint pattern matcher.
- **`/api/v1/simulation/live-attack`**: Adversarial fraud simulation engine.
- **`/api/v1/metrics/models`**: Model registry metrics.

---

## 3. Directory Map

```text
backend/
├── main.py                           # Application Lifespan & Mounting
├── app/
│   ├── api/                          # FastAPI Routers (/api/* and /api/v1/*)
│   ├── core/                         # Config, Logging, Exceptions, Sanitizer
│   ├── ml/                           # Model Loader & Preprocessors
│   ├── repositories/                 # Node, Audit, and Case Repositories
│   ├── schemas/                      # Pydantic Input/Output Validation Schemas
│   ├── services/
│   │   ├── vajra/                    # Models 1-8 Services & Master Orchestrator
│   │   ├── audit/                    # Audit Chain Service (SHA-256)
│   │   ├── legal/                    # Dossier, PDF, and Evidence Services
│   │   ├── operations/               # Dispatch & Geofence Services
│   │   └── digital_risk/             # Digital AML Risk Core Services
│   └── utils/                        # Hashing, Datetime, Geo utilities
├── evaluation/                       # Evaluation JSON Reports & Registry
├── models/                           # 14 Model Artifacts (.joblib)
└── tests/                            # Pytest Test Suite
```

---

## 4. Model Training, Validation & Server Execution

> [!IMPORTANT]
> All ML model artifacts are strictly required at backend startup. Missing model artifacts trigger explicit startup validation errors instructing how to train them.

```powershell
# 1. Install dependencies
pip install -r requirements.txt

# 2. Train Onboarding LightGBM Model
python -m training.onboarding.train_onboarding_model

# 3. Train Behavioral LightGBM Model
python -m training.transaction.train_behavioral_model

# 4. Train LSTM Sequence Model
python -m training.transaction.train_sequence_model

# 5. Train Master VAJRA ML Suite (Models 1–8)
python -m training.train_all_models

# 6. Verify Model Artifact Health & Self-Test
python verify_complete_pipeline.py

# 7. Execute Strict Model & Pipeline Unit Tests
python -m unittest tests/test_model_pipeline_strict.py
python -m unittest tests/test_readiness_and_streams.py

# 8. Run Application Server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
