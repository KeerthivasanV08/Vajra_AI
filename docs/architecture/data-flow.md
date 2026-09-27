# VAJRA AI — End-to-End Data Flow Architecture

> **Platform**: VAJRA AI Predictive Cybercrime Interception Platform

---

## 1. Master Pipeline Data Flow

The complete data pipeline follows a strict, single-direction sequence:

```
[Digital Transaction Event]
          │
          ▼
1. Digital AML Risk Engine
   ├── Input: Transaction context, account history
   └── Output: digital_risk_score (0.0-1.0), mule_probability (0.0-1.0)
          │
          ▼
2. Model 1 — IP-to-Geo Trajectory Prediction
   ├── Input: IP, session history, VPN/proxy flags
   └── Output: predicted_lat, predicted_lon, trajectory_confidence
          │
          ▼
3. Non-ML Spatial Candidate Shortlisting
   ├── Input: predicted_lat, predicted_lon
   └── Output: Top-20 nearest withdrawal nodes (with Haversine distances)
          │
          ├──────────────────────────────────────┐
          ▼                                      ▼
4a. Model 2 — Node Vulnerability        4b. Model 3 — Spatial Region
    ├── Input: Node attributes, volume      ├── Input: Account drain ratio, 24h sum
    └── Output: vulnerability_score         └── Output: region_cluster_id
          │                                      │
          └──────────────────┬───────────────────┘
                             ▼
5. Model 4 — Top-K Node Candidate Re-Ranker
   ├── Input: Top-20 candidate shortlist + features
   └── Output: Ranked candidate list + Top-3 operational terminals
          │
          ▼
6. Model 5 — Cross-Border Early Warning
   ├── Input: Foreign session ratio, VPN ratio
   └── Output: cross_border_risk_score, imminent_overseas_shift (bool)
          │
          ▼
7. Model 6 — SOP Fusion Engine & Calibration
   ├── Formula: 0.45 * Digital + 0.35 * Physical + 0.20 * Context
   ├── Check: IF imminent_overseas_shift == TRUE -> INTERNATIONAL_ALERT_OVERRIDE
   ├── Calibration: Isotonic Regression transform
   └── Output: calibrated_score, sop_tier, action_description
          │
          ▼
8. Operational Dispatch & Legal Dossier Generation
   ├── PCR Patrol Dispatch -> dispatch_id, status: SENT
   ├── Legal Dossier PDF Generator -> evidence_sha256, pdf_bytes
   └── Audit Chain Ledger -> append_event(action_type, payload_hash, previous_hash)
```

---

## 2. Shared Data Schemas & Entity Identifiers

- `case_id`: Primary identifier for an operational investigation (`CASE_VAJRA_XXXXXXXXXX`).
- `account_id`: Primary identifier for victim or mule account (`ACC_1001_MULE`).
- `node_id`: Primary identifier for terminal withdrawal point (`NODE010308`).
- `dispatch_id`: Primary identifier for PCR patrol or bank step-up dispatch (`DISPATCH_PCR_XXXXXXXXXX`).
- `dossier_id`: Primary identifier for compiled court legal dossier (`DOSSIER_XXXXXXXXXX`).
- `event_id`: Primary identifier for block-linked audit ledger event (`EVENT_XXXXXXXXXX`).
