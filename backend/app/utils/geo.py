"""
Geographic Utilities Module for VAJRA Platform.
Provides haversine distance calculation, bearing, speed, and directional change calculations.
"""

import math
from typing import Tuple

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the Great-Circle distance between two points on Earth in kilometers using Haversine formula."""
    if lat1 == lat2 and lon1 == lon2:
        return 0.0

    R = 6371.0  # Earth's mean radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))

    return round(R * c, 4)

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate compass bearing (direction) in degrees (0..360) from point 1 to point 2."""
    if lat1 == lat2 and lon1 == lon2:
        return 0.0

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)

    bearing = math.degrees(math.atan2(y, x))
    return round((bearing + 360.0) % 360.0, 2)

def calculate_speed_kmph(distance_km: float, elapsed_seconds: float) -> float:
    """Calculate speed in km/h given distance in km and time in seconds."""
    if elapsed_seconds <= 0:
        return 0.0
    hours = elapsed_seconds / 3600.0
    return round(distance_km / hours, 2)

def calculate_direction_change(bearing1: float, bearing2: float) -> float:
    """Calculate absolute directional change in degrees between two consecutive bearings."""
    diff = abs(bearing1 - bearing2) % 360.0
    return round(360.0 - diff if diff > 180.0 else diff, 2)
