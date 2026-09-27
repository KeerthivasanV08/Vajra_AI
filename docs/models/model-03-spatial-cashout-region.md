# Model 03 — Spatial Cash-Out Region Prediction Model

> **Model ID**: `model3_spatial_region`  
> **Artifact Path**: `backend/models/spatial_region_model.joblib`  
> **Preprocessor Path**: `backend/models/spatial_region_preprocessor.joblib`  
> **Evaluation Report**: `backend/evaluation/model3_spatial_region_metrics.json`  
> **Visualizations**: [`docs/images/model3_spatial_region/`](../images/model3_spatial_region/)

---

## 1. Executive Summary & Purpose

Model 3 predicts the coarse geographic region or spatial corridor cluster where a fraudulent cash-out is likely to occur based on account transaction history, velocity spikes, and fragmentation metrics.

---

## 2. Model Specifications & Hyperparameters

- **Algorithm**: `XGBClassifier` (Multiclass Extreme Gradient Boosting)
- **Target Variable**: `region_target` (Multiclass region cluster ID)
- **Training Dataset**: `vajra_feature_dataset.csv`
- **Train / Validation / Test Split**:
  - Train: 21,000 rows (70%)
  - Validation: 4,500 rows (15%)
  - Test: 4,500 rows (15%)
- **Random Seed**: `42`
- **Training Timestamp**: `2026-09-27T01:23:14`

---

## 3. Input Features & Schema

| Feature Name | Type | Description | Preprocessing |
| :--- | :--- | :--- | :--- |
| `account_age_days` | `int` | Age of victim/mule account in days | Standard Scaling |
| `transaction_count` | `int` | Lifetime transaction count | Log Standard Scaling |
| `average_transaction_amount` | `float` | Mean transaction amount in INR | Standard Scaling |
| `total_transaction_amount` | `float` | Total inflow/outflow volume in INR | Log Standard Scaling |
| `rolling_1h_sum` | `float` | Cumulative transaction sum in last 1 hour | Log Standard Scaling |
| `rolling_24h_sum` | `float` | Cumulative transaction sum in last 24 hours | Log Standard Scaling |
| `txn_count_1h` | `int` | Transaction count in last 1 hour | Standard Scaling |
| `txn_count_24h` | `int` | Transaction count in last 24 hours | Standard Scaling |
| `unique_counterparties_24h` | `int` | Distinct sender/receiver accounts in 24h | Standard Scaling |
| `drain_ratio_reference` | `float` | Inflow vs withdrawal drain ratio | Standard Scaling |
| `fragmentation_score_reference` | `float` | Account splitting/layering score | Standard Scaling |

---

## 4. Evaluation Metrics & Performance Results

Verified against holdout evaluation dataset `model3_spatial_region_metrics.json`:

- **Main Metric (Top-1 Region Accuracy)**: `15.76%` (`0.1576`)
- **Top-3 Region Accuracy**: `42.96%` (`0.4296`)
- **Macro F1-Score**: `0.0574`
- **Weighted F1-Score**: `0.0948`
- **Baseline Top-1 Accuracy (Random Choice)**: `16.67%` (`0.1667`)

---

## 5. Audit & Limitations

- **Coarse Region Limitation**: Model 3 provides high-level regional clustering. Terminal-level precision is achieved downstream by combining Model 1 (Trajectory) and Model 4 (Node Re-Ranker).
- **Evaluation Status**: `PASS_WITH_WARNINGS` (Low Top-1 single-region accuracy; relies on Top-3 regional candidates for operational shortlisting).

---

## 6. Runtime Integration

- **Backend Service**: `backend/app/services/vajra/spatial_prediction_service.py`
- **Primary Method**: `spatial_prediction_service.predict_region(account_features)`
- **Downstream Consumer**: Region predictions provide spatial boundary constraints for non-ML candidate generation.
