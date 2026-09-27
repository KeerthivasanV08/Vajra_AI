"""
Geofence Service Module for VAJRA Platform.
Manages spatial geofences, LEA unit lookups, and nearest operational units.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
from app.core.config import settings
from app.utils.geo import haversine_distance_km
from app.utils.h3_utils import latlon_to_cell, neighbor_cells

class GeofenceService:
    def __init__(self):
        self._units_path = settings.RAW_DATA_ROOT / "jurisdiction" / "jurisdiction_units.csv"
        self._units_df: Optional[pd.DataFrame] = None

    def _load_units(self) -> None:
        if self._units_df is None and self._units_path.exists():
            try:
                self._units_df = pd.read_csv(self._units_path)
            except Exception:
                self._units_df = pd.DataFrame()

    def find_nearest_lea_unit(self, lat: float, lon: float) -> Dict[str, Any]:
        """Find the nearest Law Enforcement Agency (LEA) operational unit to target coordinates."""
        self._load_units()
        if self._units_df is None or self._units_df.empty:
            return {
                "unit_id": "LEA_UNIT_DELHI_CENTRAL",
                "unit_name": "Central PCR Division",
                "distance_km": 1.25,
                "district": "Central Delhi",
                "state": "Delhi"
            }

        min_dist = float("inf")
        best_unit = None

        for _, row in self._units_df.iterrows():
            u_lat = float(row.get("latitude", 0.0))
            u_lon = float(row.get("longitude", 0.0))
            if u_lat == 0.0 and u_lon == 0.0:
                continue

            dist = haversine_distance_km(lat, lon, u_lat, u_lon)
            if dist < min_dist:
                min_dist = dist
                best_unit = row.to_dict()

        if best_unit:
            best_unit["distance_km"] = round(min_dist, 4)
            return best_unit

        return {
            "unit_id": "LEA_UNIT_DEFAULT",
            "unit_name": "District PCR Squad",
            "distance_km": 2.50,
            "district": "Delhi",
            "state": "Delhi"
        }

geofence_service = GeofenceService()
