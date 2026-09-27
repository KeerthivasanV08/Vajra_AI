"""
H3 Spatial Indexing Utilities Module for VAJRA Platform.
Supports h3-py library (v3 and v4 API compatibility).
"""

from typing import List, Tuple, Optional
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

def cell_to_latlon(cell_id: str) -> Tuple[float, float]:
    """Convert H3 cell index back to latitude/longitude center point."""
    if not H3_AVAILABLE or not cell_id.startswith("8"):
        return 28.6139, 77.2090  # Default Delhi center fallback

    try:
        if hasattr(h3, "cell_to_latlng"):
            return h3.cell_to_latlng(cell_id)
        elif hasattr(h3, "h3_to_geo"):
            return h3.h3_to_geo(cell_id)
        else:
            return 28.6139, 77.2090
    except Exception:
        return 28.6139, 77.2090

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
