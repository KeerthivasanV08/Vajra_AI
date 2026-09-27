# Model 05 — Cross-Border Early Warning Model

> **Model ID**: `model5_cross_border`  
> **Artifact Path**: `backend/models/cross_border_model.joblib`  
> **Preprocessor Path**: `backend/models/cross_border_preprocessor.joblib`  
> **Evaluation Report**: `backend/evaluation/model5_cross_border_metrics.json`  
> **Visualizations**: [`docs/images/model5_cross_border/`](../images/model5_cross_border/)

---

## 1. Executive Summary & Isolated Override Rule

Model 5 detects imminent overseas shifts, rapid cross-border IP jumps, and international flight risk. 

**CRITICAL OVERRIDE RULE**:
Model 5 operates as an **ISOLATED OVERRIDE CONDITION**. It is **NOT** a weighted numeric component in the normal fusion sum.

- **Normal Weighted Fusion**:  
  $$\text{Score} = 0.45 \times \text{Digital} + 0.35 \times \text{Physical} + 0.20 \times \text{Context}$$
- **Cross-Border Override**:  
  If `imminent_overseas_shift == TRUE` or `cross_border_risk_score >= 0.70`, the pipeline immediately triggers the `INTERNATIONAL_ALERT_OVERRIDE` SOP tier, issuing an urgent cross-border flight alert and initiating swift international freeze coordination.

---

## 2. Model Specifications & Hyperparameters

- **Algorithm**: `LogisticRegression`
- **Target Variable**: `imminent_overseas_shift_reference` (Binary 0/1 indicator)
- **Training Dataset**: `cross_border_features.csv`
- **Train / Validation / Test Split**:
  - Train: 21,000 rows (70%)
  - Validation: 4,500 rows (15%)
  - Test: 4,500 rows (15%)
- **Random Seed**: `42`
- **Training Timestamp**: `2026-09-27T01:23:30`

---

## 3. Input Features & Schema

| Feature Name | Type | Description | Preprocessing |
| :--- | :--- | :--- | :--- |
| `foreign_session_count_7d` | `int` | Number of overseas sessions in last 7 days | Standard Scaling |
| `foreign_session_count_30d` | `int` | Number of overseas sessions in last 30 days | Standard Scaling |
| `foreign_country_count` | `int` | Distinct foreign countries accessed | Standard Scaling |
| `vpn_usage_ratio_30d` | `float` | Ratio of VPN sessions in last 30 days (0.0–1.0) | MinMax Scaling |
| `foreign_ip_ratio` | `float` | Ratio of non-domestic IP sessions | MinMax Scaling |
| `domestic_session_ratio_30d` | `float` | Ratio of domestic IP sessions in last 30 days | MinMax Scaling |
| `days_since_onboarding` | `int` | Account tenure in days | Standard Scaling |
| `hours_since_first_foreign_ip` | `float` | Elapsed hours since first foreign IP activity | Standard Scaling |
| `country_transition_count` | `int` | Count of rapid inter-country IP hops | Standard Scaling |
| `is_foreign_session` | `int` (0/1) | Current session IP location is overseas | Binary Flag |

---

## 4. Evaluation Metrics & Performance Results

Verified against holdout evaluation dataset `model5_cross_border_metrics.json`:

- **ROC-AUC**: `0.9975` (`99.75%`)
- **Overall Accuracy**: `99.49%` (`0.9949`)
- **Precision**: `0.7105` (`71.05%`)
- **Recall**: `0.6923` (`69.23%`)
- **F1-Score**: `0.7013` (`0.7013`)
- **PR-AUC**: `0.7548` (`75.48%`)
- **False Positive Rate**: `0.0025` (`0.25%`)
- **False Negative Rate**: `0.3077` (`30.77%`)

---

## 5. Audit Status

- **Rule-Derived Label Warning**: `PASS_WITH_WARNINGS` (High synthetic classification performance due to rule-assisted training target generation).
- **Isolation Verification**: `PASS` (Separation from normal fusion sliders verified in `sop_fusion_service.py`).

---

## 6. Runtime Integration

- **Backend Service**: `backend/app/services/vajra/cross_border_service.py`
- **Primary Method**: `cross_border_service.predict_cross_border_risk(session_dict)`
- **Output**: Returns `{"cross_border_risk_score": float, "imminent_overseas_shift": bool}` to the SOP Fusion Engine.
