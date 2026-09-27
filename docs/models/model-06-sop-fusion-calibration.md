# Model 06 — SOP Fusion Engine & Calibration Model

> **Model ID**: `model6_sop_fusion`  
> **Artifact Path**: `backend/models/sop_calibrator.joblib`  
> **Evaluation Report**: `backend/evaluation/model6_sop_fusion_metrics.json`  
> **Visualizations**: [`docs/images/model6_sop_fusion/`](../images/model6_sop_fusion/)

---

## 1. Executive Summary & Purpose

Model 6 fuses cross-domain risk signals (Digital Risk, Physical Prediction, Contextual Risk) using system-level weights, applies Isotonic Regression calibration, evaluates cross-border overrides, and maps the final calibrated score to operational SOP action tiers.

---

## 2. Model Specifications & Fusion Arithmetic

### Domain Weights
- **Digital Risk Weight ($W_{\text{Digital}}$)**: `0.45` (`45%`) — From Digital AML Risk Engine
- **Physical Risk Weight ($W_{\text{Physical}}$)**: `0.35` (`35%`) — From Model 4 Re-Ranked Candidate Score
- **Contextual Risk Weight ($W_{\text{Context}}$)**: `0.20` (`20%`) — From Complaint/Session Context

$$\text{Raw Fusion Score} = 0.45 \times S_{\text{Digital}} + 0.35 \times S_{\text{Physical}} + 0.20 \times S_{\text{Context}}$$

### Calibration Algorithm
- **Algorithm**: `IsotonicRegression` Calibration
- **Training Dataset**: `vajra_feature_dataset.csv`
- **Train / Validation / Test Split**:
  - Train: 21,000 rows
  - Validation: 4,500 rows (Calibration tuning)
  - Test: 4,500 rows
- **Random Seed**: `42`
- **Training Timestamp**: `2026-09-27T01:23:34`

---

## 3. Operational SOP Tiers & Prototype Decision Thresholds

After calibration (or cross-border override checking), the score maps to standardized SOP Tiers:

| Calibrated Score | SOP Tier Code | Operational Action Description | Recommended Action |
| :--- | :--- | :--- | :--- |
| **Override Trigger** | `INTERNATIONAL_ALERT_OVERRIDE` | Imminent overseas shift detected | Trigger flight alert & swift freeze |
| **< 0.50** | `MONITOR` | Passive observation | Maintain telemetry monitoring |
| **0.50 – < 0.70** | `SOFT_ALERT` | Analytical warning flag | Issue soft alert for supervisor review |
| **0.70 – < 0.85** | `RECOMMEND_HOLD` | Operational delay recommendation | Issue recommendation to hold cash-out |
| **>= 0.85** | `ESCALATE_FREEZE` | Immediate account lock & patrol dispatch | Recommend immediate lock & PCR dispatch |

> **Legal Disclaimer**: SOP tiers represent prototype operational decision support policy. Seizure, freezing, or arrest requires configured LEA/Bank human authorization.

---

## 4. Evaluation Metrics & Calibration Performance

Verified against holdout evaluation dataset `model6_sop_fusion_metrics.json`:

- **Raw Brier Score**: `0.2146`
- **Calibrated Brier Score**: `0.0001`
- **Brier Score Improvement**: `0.2145` (`99.95%` reduction in calibration error)
- **Calibration Status**: `CALIBRATED_ON_VAL_SET`

---

## 5. Runtime Integration

- **Backend Service**: `backend/app/services/vajra/sop_fusion_service.py`
- **Primary Method**: `sop_fusion_service.evaluate_sop(digital_score, physical_score, context_score, imminent_overseas_shift, cross_border_risk_score)`
- **Output**: Returns `SOPEvaluationResponse` to master orchestrator.
