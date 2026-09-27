# VAJRA — Data Foundation Architecture

> **IMPORTANT DECLARATION:**  
> **ALL CURRENT DATA IN THIS PLATFORM IS 100% SYNTHETIC.**  
> - No real banking customer data is used.  
> - No real KYC data is used.  
> - No real ATM coordinates or physical hardware records are used.  
> - No real Law Enforcement Agency (LEA) operational data is used.  
> - No real personally identifiable information (PII) is used.  
> 
> Regional geographic labels (e.g., Mewat/Nuh, Alwar, Jamtara, Malda, Gurugram) are used exclusively to construct realistic spatial testing scenarios and benchmark simulation clusters for predictive cash-out interception modeling.

---

## Data Layer Architecture

```
data/
├── raw/            # Primary raw synthetic CSV datasets
├── processed/      # Normalized, cleaned & preprocessed datasets
├── reference/      # Master lookup dictionaries and spatial corridors
├── generation/     # Deterministic synthetic data generator pipeline
├── preprocessing/  # Preprocessing and ETL cleaning scripts
├── features/       # Historical descriptive feature engineering scripts
├── validation/     # Schema, spatial, temporal, and referential integrity checkers
└── manifests/      # Data manifest, column dictionary, and generation logs
```

---

## 1. Raw Datasets (`data/raw/`)

Organized into domain subdirectories:
- `digital_risk/` (`users.csv`, `devices.csv`): User Account Master and Device Master.
- `transactions/`: Multi-channel ledger transactions (`transactions.csv`).
- `onboarding/`: Signup telemetry, KYC flags, biometric scores (`onboarding_telemetry.csv`).
- `spatial/`: Withdrawal terminal nodes (`withdrawal_nodes_master.csv`), IP geo session trajectories (`ip_geo_sessions.csv`), and corridor event hubs (`corridor_hubs.csv`).
- `cross_border/`: International session jumps and VPN telemetry (`cross_border_sessions.csv`).
- `complaints/`: Victim complaints & NCRP cases (`complaints.csv`).
- `jurisdiction/`: LEA police units (`jurisdiction_units.csv`) and spatial geofence assignments (`geofence_assignments.csv`).
- `operations/`: Ground-truth prediction outcomes (`prediction_outcomes.csv`), Top-K candidate scenarios (`prediction_candidates.csv`), audit logs (`audit_logs.csv`), and legal dossier metadata (`legal_dossiers.csv`).
- `investigation/`: Syndicate pattern observations (`syndicate_patterns.csv`).

All primary raw datasets satisfy the **minimum 25,000 rows** requirement (Transactions >= **100,000 rows**).

---

## 2. Processed Datasets (`data/processed/`)

Cleaned, type-normalized, and deduplicated outputs:
- `onboarding/users_clean.csv`, `devices_clean.csv`, `onboarding_clean.csv`
- `transactions/transactions_clean.csv`
- `spatial/withdrawal_nodes_clean.csv`, `ip_geo_sessions_clean.csv`
- `cross_border/cross_border_sessions_clean.csv`
- `complaints/complaints_clean.csv`
- `jurisdiction/jurisdiction_clean.csv`, `geofence_assignments_clean.csv`
- `operations/prediction_outcomes_clean.csv`, `prediction_candidates_clean.csv`, `audit_logs_clean.csv`, `legal_dossiers_clean.csv`
- `integrated/vajra_feature_dataset.csv`, `vajra_ground_truth.csv`

---

## 3. Reference Data (`data/reference/`)

Master lookup reference files:
- `node_types/node_types.csv`
- `transaction_types/transaction_types.csv`
- `channels/channels.csv`
- `countries/countries.csv`
- `banks/banks.csv`
- `risk_bands/risk_bands.csv`
- `corridors/corridor_reference.csv`

---

## 4. Execution Commands

Generate full synthetic data foundation:
```bash
python -m data.generation.generate_all --rows 30000 --seed 42
```

Preprocess and clean raw datasets:
```bash
python -m data.preprocessing.preprocess_all
```

Build engineered feature datasets:
```bash
python -m data.features.build_all_features
```

Validate all data constraints & referential integrity:
```bash
python -m data.validation.validate_all
```