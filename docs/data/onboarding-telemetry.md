# VAJRA AI Onboarding Telemetry

## 1. Purpose
The Onboarding Telemetry module captures identity verification, device hardware fingerprinting, IP address intelligence, KYC records, and digital risk signals during account creation. It serves as the primary gateway for assessing digital fraud risk prior to transaction execution and feeds downstream identity profiling, rules engine validation, behavioral LightGBM scoring, and Neo4j graph entity resolution.

## 2. Source & Provenance
- **Raw Storage Location**: [`data/raw/users.csv`](file:///d:/Vajra_AI/data/raw/users.csv) (30,000 records)
- **Processed Storage Location**: [`data/processed/onboarding_results.csv`](file:///d:/Vajra_AI/data/processed/onboarding_results.csv) (30,000 processed snapshot records)
- **Feature Matrix Storage**: [`data/processed/user_features.csv`](file:///d:/Vajra_AI/data/processed/user_features.csv)
- **Generation Method**: High-fidelity synthetic generator preserving real-world KYC distributions, SIM binding status, VPN/ISP hosting flags, and device age characteristics.
- **Provenance Standard**: Synthetic Prototype Data (labeled as `SYNTHETIC / PROTOTYPE DATA`).

## 3. Schema & Field Definitions

### 3.1 Raw Onboarding Schema (`data/raw/users.csv`)
| Field Name | Type | Required? | Nullable? | Sensitivity / PII | Description & Business Meaning |
|---|---|---|---|---|---|
| `user_id` | String | Yes | No | Canonical ID | Unique identifier for customer account (e.g., `U0`, `U1001_MULE`). Primary key across Onboarding, Transactions, and Neo4j (`Account.user_id`). |
| `kyc_status` | String | Yes | No | Internal | State of identity verification (`verified`, `pending`, `failed`, `unverified`). |
| `kyc_city` | String | No | Yes | Low PII | City associated with official KYC document. |
| `device_id` | String | Yes | No | Hardware ID | Hardware/installation unique device hash (e.g., `DEV_1234`). |
| `device_model_name` | String | No | Yes | Tech Specs | Device model string (e.g., `Samsung Galaxy S21`, `iPhone 13`). |
| `device_year` | Integer | No | Yes | Tech Specs | Release year of the mobile device. |
| `root_status` | Integer/Bool | Yes | No | Risk Signal | `1` if device is rooted/jailbroken, `0` otherwise. |
| `app_cloner_flag` | Integer/Bool | Yes | No | Risk Signal | `1` if app cloning / parallel space environment is detected, `0` otherwise. |
| `ip_address` | String | Yes | No | Network ID | IPv4 address used during onboarding registration. |
| `vpn_detected` | Integer/Bool | Yes | No | Risk Signal | `1` if IP originates from known VPN/Proxy service, `0` otherwise. |
| `isp_name` | String | No | Yes | Network | Internet Service Provider name (e.g., `Jio`, `Airtel`, `DataCenter_X`). |
| `registered_imsi` | String | No | Yes | Sensitive PII | IMSI number registered with bank account during initial onboarding. |
| `current_imsi` | String | No | Yes | Sensitive PII | Active IMSI number detected on current device session. |
| `sim_present` | Integer/Bool | Yes | No | Hardware | `1` if physical/eSIM is active in slot, `0` otherwise. |
| `sim_slot_count` | Integer | No | Yes | Hardware | Total SIM slots detected on hardware. |
| `biometric_enabled` | Integer/Bool | Yes | No | Security | `1` if fingerprint/FaceID authentication is enabled, `0` otherwise. |
| `onboarding_speed_ms` | Integer | Yes | No | Behavioral | Total elapsed milliseconds taken to complete onboarding flow. |
| `created_at` | Timestamp | Yes | No | Audit | ISO-8601 creation timestamp of the account. |

### 3.2 Processed Onboarding Risk Schema (`data/processed/onboarding_results.csv`)
| Field Name | Type | Description |
|---|---|---|
| `onboarding_id` | String | Generated onboarding evaluation session UUID. |
| `user_id` | String | Primary identity key matching `users.csv`. |
| `device_id` | String | Hardware device identifier. |
| `ip_address` | String | Ingress IP address. |
| `identity_trust_score` | Float (0–100) | Calculated identity trustworthiness score. |
| `synthetic_identity_probability` | Float (0–1) | Model-predicted probability of synthetic/fake identity. |
| `behavioral_confidence` | Float (0–1) | Assessment score of human-like onboarding behavior speed. |
| `hardware_drift_flag` | Integer (0/1) | Alert indicator for device model/hardware inconsistencies. |
| `vpn_hosting_flag` | Integer (0/1) | Combined VPN and hosting network flag. |
| `sim_binding_status` | String | SIM integrity state (`VALID`, `SIM_SWAP_DETECTED`, `MISSING_SIM`). |
| `device_reuse_count` | Integer | Number of distinct accounts created from this `device_id`. |
| `sanction_match` | Integer (0/1) | Sanctions watchlist match flag. |
| `onboarding_ml_risk` | Float (0–100) | Raw machine learning risk prediction from onboarding LightGBM model. |
| `final_risk_score` | Float (0–100) | Composite risk score after rule overrides and ML fusion. |
| `decision` | String | Risk outcome (`ALLOW`, `REVIEW`, `BLOCK`). |
| `risk_level` | String | Risk categorization (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`). |
| `requires_review` | Integer (0/1) | Human officer review requirement indicator. |
| `requires_block` | Integer (0/1) | Hard account block enforcement indicator. |
| `cooling_period_active` | Integer (0/1) | Account cooling period enforcement status. |
| `control_reason` | String | Primary explanation string for risk decision. |
| `review_priority` | String | Priority level for compliance queue (`NORMAL`, `HIGH`, `URGENT`). |
| `processed_at` | Timestamp | Ingestion evaluation timestamp. |

## 4. Entity Identifiers & Referential Integrity
- **Canonical Account Key**: `user_id` (String format `U0` to `U29999` in prototype dataset).
- **Referential Integrity Validation**:
  - `users.csv`: 30,000 unique records.
  - `onboarding_results.csv`: 30,000 unique records.
  - 100% exact match between `users.csv` and `onboarding_results.csv` on `user_id`.
  - Transaction senders and receivers cross-reference `user_id`. (Note: 62 senders and 75 receivers in transaction telemetry represent external counter-party accounts outside the internal user roster).

## 5. Feature Engineering & ML Pipeline Integration
Onboarding telemetry is ingested by `backend/app/services/onboarding/onboarding_service.py` and converted into 18 ML features used by Model 0 (Onboarding Risk Model):
1. `sim_mismatch_flag` = `1` if `registered_imsi` != `current_imsi` else `0`.
2. `rapid_completion_flag` = `1` if `onboarding_speed_ms` < 15,000 ms else `0`.
3. `root_or_cloned` = `root_status` | `app_cloner_flag`.
4. `device_reuse_count` = aggregate count of `user_id` per `device_id`.
5. `ip_reuse_count` = aggregate count of `user_id` per `ip_address`.
6. `final_risk_score` = fed directly into Neo4j node initialization (`Account.risk_score`).

## 6. Models & Downstream Services Using Onboarding Data
- **Onboarding Risk Model (Model 0)**: Predicts synthetic identity and onboarding fraud risk.
- **Rules Engine (`control_service.py`)**: Checks SIM swap, VPN usage, device rooting, and sanction lists.
- **Neo4j Cypher Loader (`backend/scripts/load_to_neo4j.py`)**: Merges onboarding metadata onto `:Account` nodes (`created_at`, `kyc_status`, `risk_score`, `risk_level`, `requires_block`).
- **Account 360 API (`/api/v1/account/{account_id}/360`)**: Exposes onboarding telemetry to the VAJRA Security Intelligence Console.

## 7. Security, PII & Compliance
- **PII Storage**: `registered_imsi` and `current_imsi` contain sensitive mobile subscriber data. In production, these fields must be hashed via SHA-256 before persistence.
- **Data Protection**: Local prototype CSV storage is restricted to non-production environments.

## 8. Current Readiness Status
- **Status**: `READY_WITH_WARNINGS`
- **Warnings**: Hashing on IMSI attributes is non-enforced in local prototype CSVs; data generation relies on synthetic random seeds. Pipeline execution, API serving, and Neo4j loading are fully functional.
