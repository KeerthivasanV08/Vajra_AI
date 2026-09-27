"""
Common utilities for VAJRA synthetic data generation.
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd
from faker import Faker

PROJECT_ROOT = Path(__file__).resolve().parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data.generation.config import MIN_ROWS

def set_seed(seed: int = 42):
    """Set deterministic random seed across numpy and faker."""
    np.random.seed(seed)
    fake = Faker('en_IN')
    Faker.seed(seed)
    return fake

def save_dataset(df: pd.DataFrame, output_path: Path, min_rows: int = MIN_ROWS, name: str = "Dataset") -> Path:
    """Save dataframe to CSV, creating parent directories and checking row count."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    if len(df) < min_rows:
        print(f"[WARNING] {name} row count ({len(df)}) is less than recommended minimum ({min_rows}).")
    
    df.to_csv(output_path, index=False)
    print(f"[GENERATED] {name}: {len(df):,} rows -> {output_path}")
    return output_path

def generate_synthetic_ip(np_rng=np.random) -> str:
    """Generate deterministic synthetic IPv4 address (reserved/private ranges)."""
    # 10.x.x.x, 172.16.x.x, 192.168.x.x or 100.64.x.x (CGNAT)
    prefix_type = np_rng.choice([10, 172, 192, 100])
    if prefix_type == 10:
        return f"10.{np_rng.randint(0, 256)}.{np_rng.randint(0, 256)}.{np_rng.randint(1, 255)}"
    elif prefix_type == 172:
        return f"172.{np_rng.randint(16, 32)}.{np_rng.randint(0, 256)}.{np_rng.randint(1, 255)}"
    elif prefix_type == 192:
        return f"192.168.{np_rng.randint(0, 256)}.{np_rng.randint(1, 255)}"
    else:
        return f"100.{np_rng.randint(64, 128)}.{np_rng.randint(0, 256)}.{np_rng.randint(1, 255)}"

def add_geo_jitter(lat: float, lon: float, std_km: float = 5.0) -> tuple:
    """Add bounded Gaussian spatial noise around a center coordinate."""
    # 1 deg lat ~ 111 km
    lat_offset = np.random.normal(0, std_km / 111.0)
    # 1 deg lon ~ 111 * cos(lat) km
    lon_offset = np.random.normal(0, std_km / (111.0 * max(0.2, np.cos(np.radians(lat)))))
    
    new_lat = round(float(lat + lat_offset), 6)
    new_lon = round(float(lon + lon_offset), 6)
    
    # Bound to valid geographical boundaries
    new_lat = max(-89.9, min(89.9, new_lat))
    new_lon = max(-179.9, min(179.9, new_lon))
    return new_lat, new_lon
