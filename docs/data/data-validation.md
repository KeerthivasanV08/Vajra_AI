# VAJRA AI Data Validation Rules & Constraints

## 1. Overview
This document specifies the validation rules, data constraints, boundary limits, and sanitization functions applied across Onboarding Telemetry, Transaction Telemetry, and Neo4j Graph loading pipelines.

## 2. Onboarding Data Validation Rules

| Attribute | Valid Range / Format | Null Policy | Default / Fallback | Validation Logic |
|---|---|---|---|---|
| `user_id` | String (`U[0-9]+` or `ACC_[0-9]+`) | Non-Null | Required | Must be non-empty string. |
| `kyc_status` | Enum (`verified`, `pending`, `failed`, `unverified`) | Non-Null | `UNKNOWN` | Normalized to uppercase string. |
| `root_status` | Integer (`0` or `1`) | Non-Null | `0` | Coerced to `0` or `1`. |
| `vpn_detected` | Integer (`0` or `1`) | Non-Null | `0` | Coerced to `0` or `1`. |
| `ip_address` | IPv4 standard string (`x.x.x.x`) | Non-Null | `127.0.0.1` | Regex validated or assigned default loopback. |
| `onboarding_speed_ms` | Positive Integer (> 0) | Non-Null | `30000` | Values < 0 clamped to 0. |

## 3. Transaction Data Validation Rules

| Attribute | Valid Range / Format | Null Policy | Default / Fallback | Validation Logic |
|---|---|---|---|---|
| `trans_id` | Unique String (`T[0-9]+` or UUID) | Non-Null | Required | Uniqueness enforced. |
| `amount` | Float (> 0.00 INR) | Non-Null | `0.0` | Negative amounts rejected. Amounts > 49,000 INR flag threshold alerts. |
| `sender_bal_before` | Float (>= 0.00 INR) | Non-Null | `0.0` | Negative balances clamped to 0. |
| `sender_bal_after` | Float (>= 0.00 INR) | Non-Null | `0.0` | Verified against `sender_bal_before - amount`. |
| `timestamp` | ISO-8601 Datetime | Non-Null | `now()` | Future timestamps (> current server time + 5m) rejected. |
| `channel` | Enum (`UPI`, `IMPS`, `NEFT`, `ATM`, `NET_BANKING`) | Non-Null | `UPI` | Normalized uppercase string. |

## 4. Neo4j Graph Validation Rules
1. **Node Key Uniqueness**: `Account.user_id`, `Device.device_id`, and `IPAddress.ip_address` must satisfy unique Cypher constraints before loading.
2. **Self-Referential Edge Protection**: `TRANSFER` and `SHARED_DEVICE` edges between identical accounts (`a1.user_id == a2.user_id`) are excluded during Cypher generation.
3. **Datetime Parsing**: Timestamps converted to ISO-8601 strings (`to_iso_datetime`) before Neo4j Cypher ingestion. Missing/malformed dates fall back to `Timestamp.now().isoformat()`.

## 5. Automated Data Validation Script
Data validation unit tests reside in `backend/tests/test_readiness_and_streams.py`. The suite validates schema integrity, column types, threshold boundary conditions, and API payloads.

## 6. Current Readiness Status
- **Status**: `READY`
