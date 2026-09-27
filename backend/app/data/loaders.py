"""
Data Loaders Module for VAJRA Platform.
Provides helper functions to load processed datasets into pandas DataFrames.
"""

from typing import Optional
import pandas as pd
from app.core.config import settings

def load_users_clean() -> pd.DataFrame:
    path = settings.PROCESSED_DATA_ROOT / "onboarding" / "users_clean.csv"
    return pd.read_csv(path) if path.exists() else pd.DataFrame()

def load_transactions_clean() -> pd.DataFrame:
    path = settings.PROCESSED_DATA_ROOT / "transactions" / "transactions_clean.csv"
    return pd.read_csv(path) if path.exists() else pd.DataFrame()

def load_node_features() -> pd.DataFrame:
    path = settings.PROCESSED_DATA_ROOT / "spatial" / "node_features.csv"
    return pd.read_csv(path) if path.exists() else pd.DataFrame()

def load_cross_border_features() -> pd.DataFrame:
    path = settings.PROCESSED_DATA_ROOT / "cross_border" / "cross_border_features.csv"
    return pd.read_csv(path) if path.exists() else pd.DataFrame()

def load_vajra_integrated_dataset() -> pd.DataFrame:
    path = settings.PROCESSED_DATA_ROOT / "integrated" / "vajra_feature_dataset.csv"
    return pd.read_csv(path) if path.exists() else pd.DataFrame()

def load_syndicate_patterns() -> pd.DataFrame:
    path = settings.RAW_DATA_ROOT / "investigation" / "syndicate_patterns.csv"
    return pd.read_csv(path) if path.exists() else pd.DataFrame()
