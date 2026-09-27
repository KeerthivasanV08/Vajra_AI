"""
Validation Utilities Module for VAJRA Platform.
Provides domain range checking for coordinates, probabilities, risk scores, and amounts.
"""

from typing import Tuple, Optional

def validate_coordinates(lat: float, lon: float) -> Tuple[bool, str]:
    """Validate latitude (-90 to 90) and longitude (-180 to 180)."""
    if not (-90.0 <= lat <= 90.0):
        return False, f"Latitude {lat} is out of valid range [-90, 90]."
    if not (-180.0 <= lon <= 180.0):
        return False, f"Longitude {lon} is out of valid range [-180, 180]."
    return True, "Valid"

def validate_score_range(score: float, name: str = "Score") -> Tuple[bool, str]:
    """Validate score or probability is within [0.0, 1.0]."""
    if not (0.0 <= score <= 1.0):
        return False, f"{name} {score} is out of valid probability range [0.0, 1.0]."
    return True, "Valid"

def validate_positive_amount(amount: float, name: str = "Amount") -> Tuple[bool, str]:
    """Validate amount is >= 0."""
    if amount < 0:
        return False, f"{name} {amount} cannot be negative."
    return True, "Valid"
