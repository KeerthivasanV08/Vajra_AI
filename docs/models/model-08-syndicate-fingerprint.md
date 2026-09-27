# Model 08 — Syndicate Fingerprint Matcher Model

> **Model ID**: `model8_syndicate_matcher`  
> **Artifact Path**: `backend/models/syndicate_matcher.joblib`  
> **Evaluation Report**: `backend/evaluation/model8_syndicate_metrics.json`  
> **Visualizations**: [`docs/images/model8_syndicate/`](../images/model8_syndicate/)

---

## 1. Executive Summary & Investigative Boundary

Model 8 matches transaction network topology features against pre-calculated syndicate centroids using Cosine Similarity.

**INVESTIGATIVE BOUNDARY**:  
Model 8 is an **INVESTIGATIVE INTELLIGENCE TOOL**. It does **NOT** feed automated account freeze algorithms or SOP action tiers. It assists human investigators in spotting multi-hop layering tactics.

---

## 2. Model Specifications & Algorithm

- **Algorithm**: `Cosine Similarity` Centroid Pattern Matcher
- **Training Dataset**: `syndicate_patterns.csv` (30,000 observations across 7 syndicate centroid profiles)
- **Target Variable**: `pattern_type`
- **Training Timestamp**: `2026-09-27T01:23:40`
- **Random Seed**: `42`

---

## 3. Input Features & Schema

| Feature Name | Type | Description | Preprocessing |
| :--- | :--- | :--- | :--- |
| `hop_count` | `int` | Total transaction hops traced in mule chain | Standard Scaling |
| `fan_out_factor` | `float` | Branching ratio of recipient accounts | Standard Scaling |
| `layering_time_mins` | `float` | Total minutes taken across layering chain | Log Standard Scaling |
| `average_interhop_velocity_mins` | `float` | Mean minutes per transaction hop | Standard Scaling |
| `terminal_node_risk_reference` | `float` | Destination terminal vulnerability score | Standard Scaling |

---

## 4. Evaluated Syndicate Pattern Profiles (7 Patterns)

1. `RAPID_MULE_FANOUT` — High fan-out velocity across multiple fresh accounts.
2. `CIRCULAR_LAYERING_RING` — Recurrent looping transfers between paired accounts.
3. `EXPRESS_TERMINAL_DRAIN` — Immediate cash-out within 5 minutes of receipt.
4. `CROSS_BANK_DISPERSAL` — Multi-bank split transfers to evade single-bank thresholds.
5. `HIGH_VELOCITY_SPLITTING` — Micro-amount transfers split across 10+ accounts.
6. `MICRO_ATM_DENSE_SWARM` — Concentrated cash-outs across neighboring Micro-ATMs.
7. `DORMANT_ACCOUNT_REACTIVATION` — Sudden high-volume cash-out on aged dormant accounts.

---

## 5. Evaluation Metrics & Performance Results

Verified against holdout evaluation dataset `model8_syndicate_metrics.json`:

- **Main Metric (Precision@1)**: `14.75%` (`0.1475`)
- **Precision@3**: `43.86%` (`0.4386`)
- **Precision@5**: `72.42%` (`0.7242`)
- **Average Top-1 Similarity Score**: `0.7046`

---

## 6. Runtime Integration

- **Backend Service**: `backend/app/services/vajra/syndicate_service.py`
- **Primary Method**: `syndicate_service.match_syndicate_fingerprint(pattern_features)`
- **UI Endpoint**: Exposed at `POST /api/v1/syndicate/match` and rendered on the **Mule Ring Investigator** page (`/mule-ring-investigator`).
