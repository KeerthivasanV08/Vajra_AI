# Model 07 — Fairness & Bias Governance Audit Model

> **Model ID**: `model7_fairness_audit`  
> **Artifact Path**: `backend/evaluation/fairness_audit.json`  
> **Evaluation Report**: `backend/evaluation/model7_fairness_metrics.json`  
> **Visualizations**: [`docs/images/model7_fairness/`](../images/model7_fairness/)

---

## 1. Executive Summary & Non-Scoring Governance Boundary

Model 7 evaluates disparate impact ratios (DIR) and statistical equity across regional demographic groups.

**GOVERNANCE BOUNDARY**:  
Model 7 is a **NON-SCORING GOVERNANCE LAYER**. It does **NOT** feed real-time prediction scoring, fusion logic, or SOP action tiers. Its purpose is offline equity audit and compliance monitoring.

---

## 2. Audit Specifications & Disparate Impact Ratio (DIR)

- **Audit Type**: Disparate Impact & Statistical Parity Auditor
- **Dataset**: `users_clean.csv` (30,000 observations across 11 regional demographic groups)
- **Disparate Impact Metric**:
  $$\text{DIR} = \frac{P(\text{Predicted High Risk} \mid \text{Group}_i)}{P(\text{Predicted High Risk} \mid \text{Overall Population})}$$
- **4/5ths Rule Threshold**: A group DIR below `0.80` or above `1.25` triggers a compliance review flag.

---

## 3. Verified Audit Results Across 11 Regional Groups

Verified against holdout report `backend/evaluation/fairness_audit.json`:

- **Analyzed Groups Count**: `11`
- **Overall Population High-Risk Rate**: `14.86%` (`0.1486`)
- **Mean Disparate Impact Ratio**: `1.0041`

| Regional Group | High-Risk Rate (%) | Confirmed Fraud (%) | DIR | Governance Status Flag |
| :--- | :--- | :--- | :--- | :--- |
| **New Delhi** | 15.2% | 14.8% | 1.02 | `COMPLIANT` |
| **Mumbai** | 14.9% | 14.5% | 1.00 | `COMPLIANT` |
| **Bengaluru** | 14.6% | 14.1% | 0.98 | `COMPLIANT` |
| **Kolkata** | 15.1% | 14.7% | 1.02 | `COMPLIANT` |
| **Chennai** | 14.8% | 14.3% | 1.00 | `COMPLIANT` |
| **Hyderabad** | 14.7% | 14.2% | 0.99 | `COMPLIANT` |
| **Ahmedabad** | 15.0% | 14.6% | 1.01 | `COMPLIANT` |
| **Pune** | 14.5% | 14.0% | 0.98 | `COMPLIANT` |
| **Jaipur** | 14.9% | 14.4% | 1.00 | `COMPLIANT` |
| **Lucknow** | 15.3% | 14.9% | 1.03 | `COMPLIANT` |
| **Patna** | 14.4% | 13.9% | 0.97 | `COMPLIANT` |

---

## 4. Runtime Integration

- **Backend Service**: `backend/app/services/vajra/fairness_audit_service.py`
- **Primary Method**: `fairness_audit_service.get_fairness_summary()`
- **UI Endpoint**: Exposed at `GET /api/v1/fairness-audit` and rendered on the **Fairness Audit Page** (`/fairness-audit`).
