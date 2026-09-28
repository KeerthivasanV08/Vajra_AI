"""
H3 Spatial Indexing Utilities Module for VAJRA Platform.
Supports h3-py library (v3 and v4 API compatibility).
"""

from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from app.core.config import settings
from app.core.logging import logger

try:
    import h3
    H3_AVAILABLE = True
except ImportError:
    H3_AVAILABLE = False
    h3 = None

def latlon_to_cell(lat: float, lon: float, resolution: Optional[int] = None) -> str:
    """Convert latitude/longitude to H3 spatial cell index."""
    res = resolution if resolution is not None else settings.H3_RESOLUTION
    if not H3_AVAILABLE:
        # Graceful cell string fallback based on rounded grid
        return f"CELL_GRID_{int(lat * 100)}_{int(lon * 100)}"

    try:
        # H3 v4 API
        if hasattr(h3, "latlng_to_cell"):
            return h3.latlng_to_cell(lat, lon, res)
        # H3 v3 API fallback
        elif hasattr(h3, "geo_to_h3"):
            return h3.geo_to_h3(lat, lon, res)
        else:
            return f"CELL_GRID_{int(lat * 100)}_{int(lon * 100)}"
    except Exception as e:
        logger.warning(f"H3 cell conversion error: {e}")
        return f"CELL_GRID_{int(lat * 100)}_{int(lon * 100)}"


@lru_cache(maxsize=1)
def _synthetic_region_centroids() -> Dict[str, Tuple[float, float]]:
    from app.core.storage_paths import PROCESSED_DIR
    import pandas as pd

    path = PROCESSED_DIR / "spatial" / "ip_geo_sessions_clean.csv"
    if not path.exists():
        return {}

    try:
        frame = pd.read_csv(path, usecols=["district", "geo_lat", "geo_lon"])
        frame = frame.dropna(subset=["district", "geo_lat", "geo_lon"])
        district_codes = frame["district"].astype("category").cat.codes
        frame["cell_id"] = "CELL_" + ((district_codes % 50) + 1).astype(str).str.zfill(3)
        return {
            cell_id: (float(group["geo_lat"].mean()), float(group["geo_lon"].mean()))
            for cell_id, group in frame.groupby("cell_id")
        }
    except (OSError, ValueError, KeyError) as exc:
        logger.error("Could not resolve synthetic trajectory regions from %s: %s", path, exc)
        return {}


def cell_to_latlon(cell_id: str) -> Tuple[float, float]:
    """Convert H3 cell index back to latitude/longitude center point."""
    if not cell_id.startswith("8"):
        centroid = _synthetic_region_centroids().get(cell_id)
        if centroid is None:
            raise ValueError(f"Unknown trajectory region label: {cell_id}")
        return centroid

    if not H3_AVAILABLE:
        raise ValueError("H3 support is unavailable for resolving this cell index")

    try:
        if hasattr(h3, "cell_to_latlng"):
            return h3.cell_to_latlng(cell_id)
        elif hasattr(h3, "h3_to_geo"):
            return h3.h3_to_geo(cell_id)
        raise ValueError("Installed H3 version does not support cell-to-coordinate conversion")
    except Exception as exc:
        raise ValueError(f"Could not resolve H3 cell index: {cell_id}") from exc

def neighbor_cells(cell_id: str, k: int = 1) -> List[str]:
    """Get k-ring neighbor cells surrounding a given H3 cell."""
    if not H3_AVAILABLE or not cell_id.startswith("8"):
        return [cell_id]

    try:
        if hasattr(h3, "grid_disk"):
            return list(h3.grid_disk(cell_id, k))
        elif hasattr(h3, "k_ring"):
            return list(h3.k_ring(cell_id, k))
        else:
            return [cell_id]
    except Exception:
        return [cell_id]
