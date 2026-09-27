# VAJRA AI Synthetic Data Provenance & Generator Architecture

## 1. Purpose & Disclaimer
> [!IMPORTANT]
> **PROTOTYPE DATA DISCLAIMER**: All datasets in `data/raw/` and `data/processed/` (including `users.csv`, `transactions.csv`, `onboarding_results.csv`, `recent_transactions.csv`, and associated spatial node CSVs) contain **SYNTHETIC PROTOTYPE DATA**. No real bank account holder records, actual customer PII, live banking credentials, or confidential law enforcement telemetry are contained in this repository.

## 2. Generator Modules & Locations
Synthetic data generation scripts reside in `data/generators/` and `data/generation/`:
- **Onboarding Generator**: `data/generators/generate_onboarding_data.py` (Generates synthetic device models, IMSI pairs, KYC status, VPN flags, and root statuses).
- **Transaction Generator**: `data/generators/generate_transaction_data.py` (Generates synthetic transaction sequences, balance depletion profiles, structuring patterns, and velocity metrics).
- **Spatial Node Generator**: `data/generators/generate_spatial_nodes.py` (Generates synthetic ATM/branch cash-out coordinates across Indian metropolitan jurisdictions).

## 3. Seed Control & Reproducibility
- **Random Seeds**: Fixed seeds (`seed=42`) are embedded in numpy, pandas, and random generators to ensure deterministic dataset generation.
- **Distribution Profiles**: Synthetic generation models preserve realistic power-law transaction amount distributions, realistic peak transaction hours (night time vs day time), and realistic mule ring graph clustering coefficients.

## 4. Entity Correlation Preservation
The synthetic generation process explicitly enforces cross-dataset referential integrity:
1. `user_id` values generated in `users.csv` serve as the direct lookup keys for `sender_id` and `receiver_id` in `transactions.csv`.
2. Hardware `device_id` and ingress `ip_address` strings are shared between onboarding profiles and transaction records to enable multi-account device sharing detection in Neo4j.
3. Spatial coordinates in `transactions.csv` map to realistic H3 spatial resolution cells matching synthetic ATM nodes in `spatial/nodes.csv`.

## 5. Limitations & Future Production Integration
- **Local Machine Constraints**: The current prototype synthetic dataset comprises 30,000 onboarding records and 30,746 transaction records designed for rapid local machine evaluation.
- **Production Integration Path**: In live production deployment, the synthetic file data source layer is replaced by Kafka/RabbitMQ event streams and real-time bank core API connectors.

## 6. Current Readiness Status
- **Status**: `READY`
