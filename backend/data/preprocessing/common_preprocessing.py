"""
Common preprocessing utilities for VAJRA data processing layer.
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

def load_raw_csv(filepath: Path) -> pd.DataFrame:
    """Load raw CSV file."""
    filepath = Path(filepath)
    if not filepath.exists():
        raise FileNotFoundError(f"Raw CSV not found at: {filepath}")
    return pd.read_csv(filepath)

def save_clean_csv(df: pd.DataFrame, output_path: Path, name: str = "Dataset") -> Path:
    """Save cleaned dataframe to processed directory."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"[PREPROCESSED] {name}: {len(df):,} rows -> {output_path}")
    return output_path

def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize dataframe column names to lowercase snake_case."""
    df = df.copy()
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    return df

def parse_timestamps(df: pd.DataFrame, time_cols: list) -> pd.DataFrame:
    """Parse timestamp columns to ISO standard format."""
    df = df.copy()
    for col in time_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    return df

def deduplicate_exact(df: pd.DataFrame) -> pd.DataFrame:
    """Remove exact duplicate rows."""
    return df.drop_duplicates()
