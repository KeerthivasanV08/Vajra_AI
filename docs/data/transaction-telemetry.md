# VAJRA AI Transaction Telemetry

## 1. Purpose
Transaction Telemetry captures streaming financial movements, velocity metrics, device/IP network identifiers, balance depletion rates, and spatial-temporal coordinates. It forms the primary data input for real-time behavioral LightGBM scoring, sequence pattern recognition (LSTM/TCN), spatial cash-out trajectory prediction, and Neo4j transfer graph construction.

## 2. Source & Provenance
- **Raw Storage Location**: [`data/raw/transactions.csv`](file:///d:/Vajra_AI/data/raw/transactions.csv) (30,746 records)
- **Processed Storage Location**: [`data/processed/recent_transactions.csv`](file:///d:/Vajra_AI/data/processed/recent_transactions.csv) (30,000 processed transaction records)
- **Feature Storage**: [`data/processed/transaction_features.csv`](file:///d:/Vajra_AI/data/processed/transaction_features.csv) & [`data/processed/user_velocity.csv`](file:///d:/Vajra_AI/data/processed/user_velocity.csv)
- **Generation Method**: High-fidelity synthetic transaction engine simulating high-velocity fraud chains, structuring patterns, mule network layering, and spatial travel trajectories.
- **Provenance Standard**: Synthetic Prototype Data (`SYNTHETIC / PROTOTYPE DATA`).

## 3. Schema & Field Definitions

### 3.1 Raw Transaction Telemetry Schema (`data/raw/transactions.csv`)
| Field Name | Type | Required? | Nullable? | Description & Business Meaning |
|---|---|---|---|---|
| `trans_id` | String | Yes | No | Unique transaction UUID / identifier (e.g., `T0`, `T30745`). Unique across 30,746 records. |
| `sender_id` | String | Yes | No | Originating account identifier (`user_id`). |
| `receiver_id` | String | Yes | No | Destination account identifier (`user_id`). |
| `amount` | Float | Yes | No | Transaction value in INR. |
| `transaction_type` | String | Yes | No | Payment method (`P2P`, `P2M`, `ATM_WITHDRAWAL`, `WIRE`). |
| `channel` | String | Yes | No | Ingress channel (`UPI`, `IMPS`, `NEFT`, `NET_BANKING`, `ATM`). |
| `sender_bal_before` | Float | Yes | No | Sender account balance immediately prior to transaction execution. |
| `sender_bal_after` | Float | Yes | No | Sender account balance immediately following transaction execution. |
| `receiver_bal_after`| Float | Yes | No | Receiver account balance following transaction execution. |
| `timestamp` | Timestamp | Yes | No | ISO-8601 execution timestamp. |
| `location` | String | No | Yes | Spatial coordinates or city string (e.g., `12.9716,77.5946`). |
| `is_sim_bound` | Integer/Bool | Yes | No | SIM binding integrity status at transaction time (`1` = valid, `0` = unbound/unverified). |
| `device_id` | String | Yes | No | Hardware identifier of device submitting the transaction. |
| `time_to_pay_ms` | Integer | No | Yes | Biometric/keyboard interaction speed prior to submitting transaction. |
| `txn_velocity_1h` | Integer | No | Yes | Count of transactions executed by sender in past 1 hour. |
| `drain_ratio` | Float | No | Yes | Ratio of transaction amount relative to pre-transaction balance (`amount / sender_bal_before`). |
| `forwarding_delay_mins`| Float | No | Yes | Minutes elapsed between receiving funds and forwarding funds (mule pass-through speed). |
| `balance_depletion_speed`| Float | No | Yes | Rate of balance drain per minute. |
| `amount_deviation` | Float | No | Yes | Statistical deviation of current transaction amount from account's 7-day average. |
| `avg_tx_amount_7d` | Float | No | Yes | Rolling 7-day mean transaction amount for sender account. |
| `account_age_days` | Integer | No | Yes | Age of sender account in days at transaction execution. |
| `device_shared_count`| Integer | No | Yes | Number of distinct accounts sharing the current `device_id`. |
| `ip_shared_count` | Integer | No | Yes | Number of distinct accounts sharing the current `ip_address`. |
| `graph_score` | Float | No | Yes | Pre-computed graph risk metric. |
| `vpn_flag` | Integer/Bool | Yes | No | `1` if transaction executed over VPN proxy, `0` otherwise. |
| `city_mismatch_flag`| Integer/Bool | Yes | No | `1` if transaction location mismatches account KYC city, `0` otherwise. |
| `tx_count_24h` | Integer | No | Yes | Total transaction count for sender in previous 24 hours. |
| `pass_through_ratio` | Float | No | Yes | Inbound vs outbound flow ratio within 1-hour window. |
| `night_high_value_txn`| Integer/Bool | Yes | No | `1` if transaction executed during off-hours (23:00 - 05:00) with amount > 25,000 INR. |

### 3.2 Processed Recent Transactions Schema (`data/processed/recent_transactions.csv`)
Matches core 14 runtime fields: `trans_id`, `sender_id`, `receiver_id`, `amount`, `transaction_type`, `channel`, `sender_bal_before`, `sender_bal_after`, `receiver_bal_after`, `timestamp`, `location`, `is_sim_bound`, `device_id`, `time_to_pay_ms`.

## 4. Entity Identifiers & Referential Integrity
- **Canonical Transaction Identifier**: `trans_id` (100% unique across all 30,746 raw records).
- **Sender/Receiver Identifiers**:
  - `sender_id`: 18,609 distinct accounts.
  - `receiver_id`: 13,832 distinct accounts.
  - Total unique account entities across transaction dataset: 24,409 accounts.
  - 62 senders and 75 receivers represent counter-party/external bank entities not registered in local `users.csv`.

## 5. Temporal Semantics & Leakage Controls
To eliminate temporal leakage during ML model inference and training:
1. **Rolling Aggregations**: Features like `txn_velocity_1h`, `tx_count_24h`, `avg_tx_amount_7d`, and `pass_through_ratio` are computed strictly using historical transactions strictly preceding `timestamp`.
2. **Chronological Train/Validation Splitting**: ML models (Behavioral LightGBM, Sequence LSTM, Trajectory Model 1) are split strictly along temporal boundaries rather than random cross-validation.
3. **Real-time Feature State**: `VelocityService` and `BehaviorService` update sliding-window state in memory using transaction timestamps.

## 6. Model & Downstream Pipeline Integration
- **Behavioral LightGBM Model**: Evaluates `amount`, `drain_ratio`, `txn_velocity_1h`, `vpn_flag`, `night_high_value_txn`, and `balance_depletion_speed`.
- **Sequence Model (LSTM/TCN)**: Consumes ordered sequences of up to 10 past transactions per account to detect rapid pass-through structuring and mule fan-out behaviors.
- **Neo4j Graph Ingestion**: Ingests each transaction as an `(:Account)-[:TRANSFER {trans_id, amount, timestamp, channel}]->(:Account)` edge.
- **VAJRA Predictive Pipeline**: High-risk transactions trigger Model 1 (Spatial Trajectory), predicting physical movement toward cash-out nodes.

## 7. Current Readiness Status
- **Status**: `READY`
- **Verification**: Fully validated against backend API endpoints, database loading scripts, real-time transaction streaming, and ML feature extraction.
