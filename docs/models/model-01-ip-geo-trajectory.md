# Model 01 — IP-to-Geo Trajectory Prediction Model

> **Model ID**: `model1_trajectory`  
> **Artifact Path**: `backend/models/trajectory_model.joblib`  
> **Preprocessor Path**: `backend/models/trajectory_preprocessor.joblib`  
> **Evaluation Report**: `backend/evaluation/model1_trajectory_metrics.json`  
> **Visualizations**: [`docs/images/model1_trajectory/`](../images/model1_trajectory/)

---

## 1. Executive Summary & Purpose

Model 1 predicts the physical movement trajectory and target spatial cell of a user session based on IP telemetry, session sequence intervals, and velocity features. It projects target coordinates and confidence levels to feed non-ML candidate generation.

---

## 2. Model Specifications & Hyperparameters

- **Algorithm**: `RandomForestClassifier` (Random Forest Sequence Classifier)
- **Target Variable**: `h3_cell_target` (Spatial cell destination)
- **Training Dataset**: `ip_geo_sessions_clean.csv`
- **Train / Validation / Test Split**:
  - Train: 35,000 rows (70%)
  - Validation: 7,500 rows (15%)
  - Test: 7,500 rows (15%)
- **Random Seed**: `42`
- **Training Timestamp**: `2026-09-27T01:18:05`

---

## 3. Input Features & Schema

| Feature Name | Type | Description | Preprocessing / Scaling |
| :--- | :--- | :--- | :--- |
| `geo_lat` | `float` | Current session latitude | Standard Scaling |
| `geo_lon` | `float` | Current session longitude | Standard Scaling |
| `vpn_flag` | `int` (0/1) | Virtual Private Network indicator | Binary Flag |
| `proxy_flag` | `int` (0/1) | Anonymizing proxy indicator | Binary Flag |
| `tor_flag` | `int` (0/1) | TOR exit node indicator | Binary Flag |
| `session_sequence_number` | `int` | Sequential session ordinal in window | Standard Scaling |
| `distance_from_previous_km` | `float` | Haversine distance from previous session | Log transform + Standard Scaling |
| `time_since_previous_session_sec` | `float` | Elapsed seconds between sessions | Standard Scaling |
| `movement_direction_deg` | `float` | Bearing angle in degrees (0–360) | Trigonometric encoding |
| `geo_accuracy_km` | `float` | GeoIP precision radius in kilometers | Standard Scaling |

---

## 4. Evaluation Metrics & Performance Results

All metrics are verified against holdout evaluation dataset `model1_trajectory_metrics.json`:

- **Top-1 Cell Accuracy**: `95.41%` (`0.9541`)
- **Top-3 Cell Accuracy**: `96.88%` (`0.9688`)
- **Top-5 Cell Accuracy**: `98.43%` (`0.9843`)
- **Baseline Top-1 Accuracy**: `23.52%` (`0.2352`)
- **Mean Geographic Error**: `3.45 km`
- **Median Geographic Error**: `2.38 km`
- **95th Percentile Geographic Error**: `10.49 km`

---

## 5. Audit & Leakage Status

- **Temporal Leakage Check**: `PASS` (Chronological session sequencing maintained).
- **Feature Leakage Check**: `PASS` (No future session fields included).
- **Group / Account Overlap Warning**: `PASS_WITH_WARNINGS` (Synthetic trajectory sequences generated across synthetic account profiles).

---

## 6. Runtime Integration

- **Backend Service**: `backend/app/services/vajra/trajectory_service.py`
- **Primary Method**: `trajectory_service.predict_trajectory(account_id, session_data)`
- **Downstream Consumer**: Passes predicted lat/lon and trajectory confidence to `candidate_generation_service.py`.
