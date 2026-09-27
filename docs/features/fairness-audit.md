# Fairness Audit & Governance Console

Model 7 is a non-scoring diagnostic governance layer. It does not modify digital risk, physical prediction, SOP fusion, node vulnerability, dispatch priority, or alert severity.

## Data and calculation

The backend reads `backend/evaluation/fairness_audit.json`, produced by the seeded synthetic holdout audit. Each regional row contains the group name, prediction count, confirmed-case count, precomputed high-risk and confirmed-fraud rates, and DIR. The API normalizes these into one regional contract and persists a snapshot at `backend/evaluation/fairness_region_stats.json`.

DIR follows the Model 7 definition:

`regional predicted high-risk rate / overall predicted high-risk baseline rate`

Missing or zero-denominator values are returned as `null` and displayed as `Insufficient data`; they are never converted to zero or rendered as `NaN`.

## API and UI

- `GET /api/v1/fairness/regions` returns the canonical regional snapshot.
- `GET /api/v1/fairness/regions/{region_id}/detail` returns raw counts and available DIR history.
- `POST /api/v1/fairness/regions/recalculate` refreshes the snapshot and records a cryptographic audit event. It requires an auditor or administrator role.
- The `/fairness-audit` page displays provenance, counts, rates, DIR, governance state, filtering, sorting, and detail inspection.

The current artifact is synthetic holdout data. It contains no historical DIR snapshots, so the detail trend is empty until historical snapshots are added.