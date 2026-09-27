# VAJRA ML Pipeline Audit

Audit Timestamp: 2026-09-27T08:34:30.196228  
Overall Status: **PASS_WITH_WARNINGS**

## 1. Executive Summary
This audit independently inspected raw datasets, processed feature tables, chronological split strategies, model implementations, hyperparameters, calibration curves, governance fairness metrics, saved model artifacts, and generated evaluation charts.

- **Overall Status:** PASS_WITH_WARNINGS
- **Critical Issues Identified:** 0
- **Warnings Identified:** 7

---

## 2. Dataset Audit
- Datasets Checked: 8 model-specific pipelines
- Dataset Status: PASS

---

## 3. Data Leakage Audit
- Leakage Status: PASS

---

## 4. Model 1 Audit — Trajectory Model
- **Status:** PASS_WITH_WARNINGS
- **Algorithm:** XGBClassifier (Cell Classification)
- **Chronological Top-1 Accuracy:** 0.9541
- **Unseen-Account Group Top-1 Accuracy:** 0.9854

---

## 5. Model 2 Audit — Node Vulnerability Model
- **Status:** PASS_WITH_WARNINGS
- **Algorithm:** XGBRegressor
- **Recalculated R²:** 0.9987
- **Recalculated MAE:** 0.001

---

## 6. Model 3 Audit — Spatial Region Model
- **Status:** PASS_WITH_WARNINGS
- **Algorithm:** XGBClassifier
- **Top-1 Accuracy:** 0.1576
- **Majority Baseline:** 0.1667

---

## 7. Model 4 Audit — Node Re-Ranker Model
- **Status:** PASS_WITH_WARNINGS
- **Hit@1:** 0.9913
- **Hit@3:** 0.992
- **MRR:** 0.9923

---

## 8. Model 5 Audit — Cross-Border Early Warning Model
- **Status:** PASS_WITH_WARNINGS
- **ROC-AUC:** 0.9975
- **Recall:** 0.6923

---

## 9. Model 6 Audit — SOP Fusion Engine & Calibration
- **Status:** PASS_WITH_WARNINGS
- **Raw Brier:** 0.2146
- **Calibrated Brier:** 0.0001

---

## 10. Model 7 Audit — Fairness & Governance Bias Audit
- **Status:** PASS
- **Groups Analyzed:** 11

---

## 11. Model 8 Audit — Syndicate Fingerprint Matcher
- **Status:** PASS
- **Precision@1:** 0.1475

---

## 12. Hyperparameter Audit
- All hyperparameters extracted and cross-checked against model registries.

---

## 13. Evaluation Reproduction
- All evaluation metrics recalculated independently from saved model artifacts and holdout test splits.

---

## 14. Artifact Audit
- Valid Artifacts: 13 / 13

---

## 15. Image Organization Audit
- Total Audited PNGs: 30
- Loose Files in Root: 13

---

## 16. Issues Found
None.

---

## 17. Warnings
- MODEL1: Top-1 accuracy = 0.9541 (> 90%). Chronological split has account ID overlap.
- MODEL2: Feature 'historical_fraud_cashouts' has very high correlation (0.9523) with target 'vulnerability_score_reference'.
- MODEL2: Extremely high R² = 0.9987. Synthetic target construction dependency suspect.
- MODEL3: Model Top-1 accuracy (0.1576) is lower than majority baseline (0.1667).
- MODEL4: Hit@1 = 0.9913 (> 95%). Candidate selection or ground-truth feature leak suspect.
- MODEL5: ROC-AUC = 0.9975 (> 0.98). Synthetic label rule dependency suspect.
- MODEL6: Calibrated Brier score = 0.0001 (< 0.01). Synthetic deterministic target dependency suspect.


---

## 18. Final Verification
- Final Audit Status: **PASS_WITH_WARNINGS**
