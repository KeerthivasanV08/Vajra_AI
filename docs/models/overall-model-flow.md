# VAJRA AI — Overall Model Pipeline & Execution Flow

> **Version**: 1.0  
> **Target Platform**: VAJRA AI Predictive Cybercrime Cash-Out Interception Platform

---

## 1. Master Pipeline Overview

The VAJRA AI machine learning architecture integrates 8 specialized models and 1 spatial candidate generator into a unified prediction pipeline:

```
                    Digital Transaction Signal / Anomaly
                                      │
                                      ▼
                    Digital AML Risk Engine
                     (0.45 Digital Risk Component)
                                      │
                                      ▼
                     Session / IP Telemetry History
                                      │
                                      ▼
                  Model 1 — IP-to-Geo Trajectory Model
                   (RandomForest / Sequence Predictor)
                                      │
                         Target Coordinates & Confidence
                                      │
                                      ▼
                  Non-ML Spatial Candidate Generation
                   (Haversine Query -> Top-20 Shortlist)
                                      │
                                      ├────────────────────────┐
                                      ▼                        ▼
                       Model 2 — Node Vulnerability   Model 3 — Spatial Region
                            (XGBRegressor)                 (XGBClassifier)
                                      │                        │
                                      └───────────┬────────────┘
                                                  ▼
                               Model 4 — Node-Level Top-K Re-Ranker
                                    (XGBClassifier Ranking)
                                                  │
                                          Top-3 Candidates
                                                  │
                                                  ▼
                                Model 5 — Cross-Border Early Warning
                                      (Logistic Regression)
                                                  │
                                   ┌──────────────┴──────────────┐
                                   │                             │
                        imminent_overseas_shift = FALSE    imminent_overseas_shift = TRUE
                                   │                             │
                                   ▼                             ▼
                            Normal Fusion             Cross-Border Override
                        (0.45 Dig + 0.35 Phys + 0.20 Ctx)   (INTERNATIONAL_ALERT_OVERRIDE)
                                   │                             │
                                   └──────────────┬──────────────┘
                                                  ▼
                               Model 6 — SOP Fusion & Calibration
                                (Isotonic Regression Calibration)
                                                  │
                                         SOP Action Tier
                                                  │
                              ┌───────────────────┴───────────────────┐
                              ▼                                       ▼
                  PCR Patrol Unit Dispatch               Bank Step-Up Authentication
                              │                                       │
                              └───────────────────┬───────────────────┘
                                                  ▼
                                    Legal Dossier Generator (PDF)
                                                  │
                                                  ▼
                                 Cryptographic Audit Chain (SHA-256)
```

---

## 2. Model Roles & Inter-Model Dependencies

| Model | Model Name | Primary Input | Primary Output | Downstream Consumer |
| :--- | :--- | :--- | :--- | :--- |
| **Model 1** | IP-to-Geo Trajectory | IP & Session Telemetry | Predicted Lat/Lon, Confidence | Candidate Generation |
| **Candidate Gen** | Spatial Shortlisting (Non-ML) | Model 1 Lat/Lon | Top-20 Nearest Nodes | Model 2, Model 3, Model 4 |
| **Model 2** | Node Vulnerability | Node Attributes & Fraud History | Node Vulnerability Score (0–1) | Model 4 (Re-Ranker) |
| **Model 3** | Spatial Cash-Out Region | Transaction Aggregates & Account | Coarse Region Cluster | Model 4 (Re-Ranker) |
| **Model 4** | Node Top-K Re-Ranker | Top-20 Shortlist & Features | Ranked Candidates & Top-3 | Master Orchestrator |
| **Model 5** | Cross-Border Early Warning | Foreign Session Ratio & VPN | Overseas Shift Flag (Override) | Model 6 (SOP Fusion) |
| **Model 6** | SOP Fusion & Calibration | Digital, Physical, Context Scores | Calibrated Score & SOP Tier | Dispatch & Dossier Engines |
| **Model 7** | Fairness & Bias Audit | Demographics & Prediction Outcomes | Disparate Impact Ratio (DIR) | Non-Scoring Governance UI |
| **Model 8** | Syndicate Fingerprint | Network Topology & Velocity | Pattern Match & Similarity | Investigative Analyst UI |

---

## 3. Parallel & Non-Scoring Analytical Layers

### Model 7 — Fairness & Bias Audit
- **Role**: Operates strictly as an **offline governance diagnostic layer**.
- **Isolation**: Does NOT mutate predictions, fusion scores, or SOP tiers.
- **Output**: Generates Disparate Impact Ratios (DIR) across regional demographic groups (`fairness_audit.json`).

### Model 8 — Syndicate Fingerprint Matcher
- **Role**: Operates as an **investigative intelligence aid**.
- **Isolation**: Computes cosine similarity against 7 centroid pattern profiles (`syndicate_matcher.joblib`).
- **Output**: Identifies multi-hop layering tactics (e.g., `RAPID_MULE_FANOUT`) to assist manual case investigation without feeding automated freezing algorithms.

---

## 4. Key Engineering Invariants

1. **Candidate Shortlisting is Non-ML**: Candidate selection uses geospatial queries to select the Top-20 nearest physical withdrawal points before ML re-ranking.
2. **Cross-Border Shift is an Isolated Override**: An imminent overseas shift bypasses normal weighted fusion arithmetic to prevent diluting urgent international flight signals.
3. **Isotonic Calibration Precedes SOP Thresholding**: Raw weighted fusion scores are calibrated via Isotonic Regression before mapping to operational decision bands:
   - `< 0.50`: `MONITOR`
   - `0.50 – < 0.70`: `SOFT_ALERT`
   - `0.70 – < 0.85`: `RECOMMEND_HOLD`
   - `>= 0.85`: `ESCALATE_FREEZE`
4. **Append-Only Cryptographic Audit**: Every prediction execution appends a deterministic SHA-256 block (`SHA256(canonical_event + previous_hash)`) to the audit ledger.
