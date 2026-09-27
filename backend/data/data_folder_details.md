# VAJRA Data Folder Details & Column Specifications

> **SYNTHETIC DATA MANDATE:**  
> All records in `data/raw`, `data/processed`, and `data/features` are synthetically generated.  
> No actual customer, financial, geographical, or law enforcement records are included.

---

## Folder Breakdown

### 1. `raw/`
Contains raw generated CSVs. Each file represents an uncleaned source event log or master entity table.
- Minimum row count for primary datasets: 25,000 rows.
- Transactions minimum row count: 100,000 rows.

### 2. `processed/`
Contains ETL cleaned files:
- Datetime columns parsed to ISO format.
- Numeric values range-checked and non-negative bounds enforced.
- Categorical values converted to uppercase standard tokens.
- Exact duplicate rows removed.

### 3. `reference/`
Contains static reference lookups:
- `node_types.csv`: ATM, MICRO_ATM, AEPS_CSP, POS, CDM.
- `transaction_types.csv`: CREDIT, DEBIT, TRANSFER, REFUND, CASH_WITHDRAWAL, CASH_DEPOSIT.
- `channels.csv`: BANK, UPI, IMPS, NEFT, RTGS, AEPS, ATM, MICRO_ATM, POS, CSP.
- `countries.csv`: Domestic and foreign country codes.
- `banks.csv`: Public, private, and payment banks.
- `risk_bands.csv`: ALLOW, MONITOR, REVIEW, BLOCK.
- `corridor_reference.csv`: Spatial hub centroids.

### 4. `generation/`
Modular Python generators driven by `config.py` and `common_utils.py`.  
Command: `python -m data.generation.generate_all --rows 30000 --seed 42`

### 5. `preprocessing/`
ETL processing scripts.  
Command: `python -m data.preprocessing.preprocess_all`

### 6. `features/`
Descriptive feature builders avoiding future data leakage.  
Outputs `vajra_feature_dataset.csv` and `vajra_ground_truth.csv`.  
Command: `python -m data.features.build_all_features`

### 7. `validation/`
Comprehensive verification scripts checking schema, row counts, referential integrity, ranges, and temporal consistency.  
Command: `python -m data.validation.validate_all`

### 8. `manifests/`
Auto-generated documentation:
- `dataset_manifest.json`: Metadata for every dataset.
- `column_dictionary.csv`: Full column level documentation.
- `generation_report.json`: System execution logs.