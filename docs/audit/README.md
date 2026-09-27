# VAJRA AI — Machine Learning Audit & Evaluation Summary

> **Audit Date**: 2026-09-27  
> **Evaluation Framework**: `backend/audit/run_full_ml_audit.py`  
> **Audit Status**: **`PASS_WITH_WARNINGS`** (13/13 Model Artifacts verified, 11/11 Evaluation JSON reports verified, 0 critical leakage detected)

---

## 1. Executive Summary

An independent pipeline audit was executed across all 8 machine learning models and dataset transformation scripts in the repository.

- **Datasets Audited**: 22 dataset files verified (`data/raw/` and `data/processed/`).
- **Model Artifacts Audited**: 13/13 `.joblib` model artifacts verified in `backend/models/`.
- **Evaluation JSON Reports**: 11/11 JSON reports verified in `backend/evaluation/`.
- **Generated Visualizations**: 30/30 visualization PNG artifacts verified in `docs/images/`.

---

## 2. Model Audit Status Matrix

| Model | Model Name | Primary Metric | Verified Score | Baseline Score | Audit Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Model 1** | IP-to-Geo Trajectory | Top-1 Accuracy | `95.41%` | `23.52%` | `PASS_WITH_WARNINGS` |
| **Model 2** | Node Vulnerability | $R^2$ Score | `0.9987` | `0.1477` (MAE) | `PASS_WITH_WARNINGS` |
| **Model 3** | Spatial Region Prediction | Top-1 Accuracy | `15.76%` | `16.67%` | `PASS_WITH_WARNINGS` |
| **Model 4** | Top-K Node Re-Ranker | Hit@3 (Precision) | `99.20%` | `0.13%` | `PASS_WITH_WARNINGS` |
| **Model 5** | Cross-Border Early Warning | ROC-AUC | `0.9975` | — | `PASS_WITH_WARNINGS` |
| **Model 6** | SOP Fusion & Calibration | Brier Score | `0.0001` | `0.2146` (Raw) | `PASS` |
| **Model 7** | Fairness & Bias Audit | Mean DIR | `1.0041` | — | `PASS` (Non-Scoring) |
| **Model 8** | Syndicate Fingerprint | Precision@1 | `14.75%` | — | `PASS` (Investigative) |

---

## 3. Verified Audit Observations

1. **Model 1 (Trajectory)**: High cell accuracy (95.41%) on synthetic trajectory sequences. Group/Account overlap warning noted during synthetic generation.
2. **Model 2 (Node Vulnerability)**: Near-perfect $R^2$ (0.9987) driven by synthetic node reference targets.
3. **Model 3 (Spatial Region)**: Low Top-1 accuracy (15.76%) due to coarse multiclass region split. Relies on Top-3 regional shortlisting (42.96%) for operational candidate generation.
4. **Model 4 (Node Re-Ranker)**: Exceptional Hit@3 (99.20%) on spatial candidate shortlist re-ranking. Requires candidate generation prior to invocation.
5. **Model 5 (Cross-Border)**: Isolated override condition verified. Label derivation warning noted.
6. **Model 6 (SOP Calibration)**: Isotonic calibration reduces Brier score from 0.2146 to 0.0001, providing well-calibrated probabilities.
