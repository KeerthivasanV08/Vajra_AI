"""
Generate Reference Datasets for VAJRA Platform.
"""

import sys
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import (
    REFERENCE_DIR, NODE_TYPES, TRANSACTION_TYPES, CHANNELS,
    COUNTRIES, BANKS, RISK_BANDS, CORRIDORS
)
from data.generation.common_utils import save_dataset

def generate_reference_data():
    print("[REFERENCE] Generating reference datasets...")
    
    # 1. Node Types
    df_nodes = pd.DataFrame([
        {"node_type": "ATM", "description": "Automated Teller Machine for cash withdrawal/deposit"},
        {"node_type": "MICRO_ATM", "description": "Handheld point-of-sale device operated by business correspondents"},
        {"node_type": "AEPS_CSP", "description": "Aadhaar Enabled Payment System Customer Service Point outlet"},
        {"node_type": "POS", "description": "Point of Sale merchant cash-out or retail terminal"},
        {"node_type": "CDM", "description": "Cash Deposit Machine / Cash Recycler"}
    ])
    save_dataset(df_nodes, REFERENCE_DIR / "node_types" / "node_types.csv", min_rows=1, name="Reference Node Types")
    
    # 2. Transaction Types
    df_tx_types = pd.DataFrame([
        {"transaction_type": "CREDIT", "description": "Inbound credit to account"},
        {"transaction_type": "DEBIT", "description": "Outbound debit from account"},
        {"transaction_type": "TRANSFER", "description": "Account to account fund transfer"},
        {"transaction_type": "REFUND", "description": "Reversal or refund of previous transaction"},
        {"transaction_type": "CASH_WITHDRAWAL", "description": "Physical cash withdrawal from terminal or CSP"},
        {"transaction_type": "CASH_DEPOSIT", "description": "Physical cash deposit into account"}
    ])
    save_dataset(df_tx_types, REFERENCE_DIR / "transaction_types" / "transaction_types.csv", min_rows=1, name="Reference Transaction Types")

    # 3. Channels
    df_channels = pd.DataFrame([
        {"channel": "BANK", "description": "Core Banking Branch / Online Banking"},
        {"channel": "UPI", "description": "Unified Payments Interface"},
        {"channel": "IMPS", "description": "Immediate Payment Service"},
        {"channel": "NEFT", "description": "National Electronic Funds Transfer"},
        {"channel": "RTGS", "description": "Real Time Gross Settlement"},
        {"channel": "AEPS", "description": "Aadhaar Enabled Payment System"},
        {"channel": "ATM", "description": "ATM Network Terminal"},
        {"channel": "MICRO_ATM", "description": "Micro-ATM Terminal"},
        {"channel": "POS", "description": "Merchant POS Terminal"},
        {"channel": "CSP", "description": "Customer Service Point Outlet"}
    ])
    save_dataset(df_channels, REFERENCE_DIR / "channels" / "channels.csv", min_rows=1, name="Reference Channels")

    # 4. Countries
    df_countries = pd.DataFrame(COUNTRIES)
    save_dataset(df_countries, REFERENCE_DIR / "countries" / "countries.csv", min_rows=1, name="Reference Countries")

    # 5. Banks
    df_banks = pd.DataFrame(BANKS)
    save_dataset(df_banks, REFERENCE_DIR / "banks" / "banks.csv", min_rows=1, name="Reference Banks")

    # 6. Risk Bands
    df_risk = pd.DataFrame(RISK_BANDS)
    save_dataset(df_risk, REFERENCE_DIR / "risk_bands" / "risk_bands.csv", min_rows=1, name="Reference Risk Bands")

    # 7. Corridors Reference
    df_corrs = pd.DataFrame(CORRIDORS)
    save_dataset(df_corrs, REFERENCE_DIR / "corridors" / "corridor_reference.csv", min_rows=1, name="Reference Corridors")

if __name__ == "__main__":
    generate_reference_data()
