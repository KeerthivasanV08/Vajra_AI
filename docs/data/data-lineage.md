# VAJRA AI Data Lineage & End-to-End Architecture

## 1. Overview
This document outlines the complete data lineage across the VAJRA AI platform, mapping the trajectory of data from raw onboarding and streaming transactions through feature engineering, Neo4j graph resolution, digital risk fusion, physical cash-out prediction, SOP enforcement, dispatch, and law enforcement auditing.

## 2. Canonical Identity Hierarchy
Across all 3 data layers and 7 machine learning models, entity consistency is maintained via canonical keys:
- **Customer / Account Identity**: `user_id` / `account_id` (e.g., `U0`, `U1001_MULE`).
- **Transaction Identity**: `trans_id` (e.g., `T0`, `T30745`).
- **Device Hardware Identity**: `device_id` (e.g., `DEV_1234`).
- **Network Ingress Identity**: `ip_address` (IPv4 standard).
- **Physical Node Identity**: `node_id` / `nearest_node_id` (e.g., `ATM_BLR_102`).

## 3. End-to-End Conceptual & Actual Data Flow Map

```
             +--------------------------+
             |   ONBOARDING TELEMETRY   |
             |   (data/raw/users.csv)   |
             +------------+-------------+
                          |
                          v
             +--------------------------+
             |  IDENTITY / KYC / DEVICE |
             |   ONBOARDING RISK (M0)   |
             +------------+-------------+
                          |
                          v
+-------------------------+-------------------------+
|                                                   |
v                                                   v
+--------------------------+         +--------------------------+
|  TRANSACTION TELEMETRY   |         |    NEO4J GRAPH LAYER     |
| (data/raw/tx.csv)        |         |  (:Account)-[:TRANSFER]  |
+------------+-------------+         +------------+-------------+
             |                                    |
             v                                    v
+--------------------------+         +--------------------------+
| BEHAVIORAL & SEQUENCE ML |         |  GRAPH ML & COMMUNITY    |
| (LightGBM 30% + LSTM 25%)|         | (Graph Engine 20%)       |
+------------+-------------+         +------------+-------------+
             |                                    |
             +------------------+-----------------+
                                |
                                v
                   +--------------------------+
                   | RULES ENGINE (Rules 25%) |
                   +------------+-------------+
                                |
                                v
                   +--------------------------+
                   |   DIGITAL RISK FUSION    |
                   |   (Model 0 + 1 + 2 + 3)  |
                   +------------+-------------+
                                |
                                v
                   +--------------------------+
                   |  VAJRA PREDICTIVE ML     |
                   |  - Model 1: Trajectory   |
                   |  - Model 2: Vulnerability|
                   |  - Model 3: Spatial      |
                   |  - Model 4: Node Ranking |
                   |  - Model 5: Cross-Border |
                   +------------+-------------+
                                |
                                v
                   +--------------------------+
                   |    SOP FUSION (M6)       |
                   |  (0.45 Dig + 0.35 Phys)  |
                   +------------+-------------+
                                |
                                v
                   +--------------------------+
                   |   COMMAND & CONTROL      |
                   |   - Bank Account Freeze  |
                   |   - Police Dispatch      |
                   |   - Case Audit Ledger    |
                   +--------------------------+
```

## 4. Digital Risk Fusion Architecture Breakdown
The transaction digital risk engine (`DecisionEngine` in [`backend/app/services/transaction/decision_engine.py`](file:///d:/Vajra_AI/backend/app/services/transaction/decision_engine.py)) calculates digital risk as:

$$\text{Digital Risk Score} = (0.25 \times \text{Rules Score}) + (0.30 \times \text{Behavioral LightGBM}) + (0.25 \times \text{Sequence LSTM}) + (0.20 \times \text{Neo4j Graph ML})$$

- **Rules Engine (25%)**: Real-time hard controls (SIM swap, sanctions, root status, velocity limits).
- **Behavioral LightGBM (30%)**: Amount deviation, balance depletion speed, drain ratio.
- **Sequence LSTM/TCN (25%)**: Multi-step transaction pattern recognition.
- **Neo4j Graph ML (20%)**: Fraud proximity, mule ring community risk, layering chains.

## 5. VAJRA Physical Prediction & SOP Action Fusion
High digital risk outputs trigger the physical prediction pipeline:
1. **Model 1 (Spatial Trajectory)**: Predicts H3 spatial hex cells for suspect movement.
2. **Model 2 (Node Vulnerability)**: Computes cash-out vulnerability score across regional nodes.
3. **Model 3 (Spatial Coarse Region)**: Identifies police/bank operational jurisdiction.
4. **Model 4 (Node Ranking Candidate Engine)**: Ranks candidate withdrawal ATMs/branches.
5. **Model 5 (Cross-Border Early Warning)**: Detects international session bypasses and applies strict boolean override.
6. **Model 6 (SOP Fusion Engine)**: Combines Digital Risk ($45\%$) and Physical Risk ($35\%$) with Operational Context ($20\%$) to assign automated response tiers:
   - `TIER_1_AUTO_FREEZE`: Immediate bank API account block + SMS alert.
   - `TIER_2_DISPATCH_PATROL`: Mobile police unit dispatch to target cash-out node.
   - `TIER_3_MONITOR`: Heightened surveillance without active intervention.

## 6. Real-time Frontend Data Lineage
- **Transaction Monitor**: Receives SSE stream (`/api/v1/stream/transactions`) backed by `recent_transactions.csv` and real-time inference.
- **Account 360**: Aggregates Onboarding Telemetry, transaction history, and risk score breakdowns.
- **Graph Explorer & Mule Ring Investigator**: Directly queries Neo4j via `Neo4jClient` (`/api/v1/mule-ring/investigate/{account_id}`).
- **Spatial Heatmap & Node Candidates**: Displays live spatial predictions and candidate withdrawal nodes.

## 7. Current Readiness Status
- **Status**: `READY`
- **Verification**: Complete data pipeline end-to-end verified from ingestion to execution.
