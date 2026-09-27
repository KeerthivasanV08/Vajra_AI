"""
Prediction Schemas Module for VAJRA Platform.
Input validation and response schemas for physical cash-out prediction endpoints.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class CashoutPredictionRequest(BaseModel):
    account_id: str = Field(..., description="Target bank account ID")
    geo_lat: float = Field(..., ge=-90.0, le=90.0, description="Session origin latitude")
    geo_lon: float = Field(..., ge=-180.0, le=180.0, description="Session origin longitude")
    digital_risk_score: Optional[float] = Field(0.70, ge=0.0, le=1.0)
    mule_probability: Optional[float] = Field(0.65, ge=0.0, le=1.0)
    session_data: Optional[Dict[str, Any]] = None

class PhysicalPredictionResponse(BaseModel):
    prediction_id: str
    account_id: str
    predicted_region: str
    region_confidence: float
    trajectory: Dict[str, Any]
    candidates_count: int
    candidates: List[Dict[str, Any]]
    top_candidates: List[Dict[str, Any]]
    top_prediction: Dict[str, Any]
    physical_prediction_score: float
    predicted_time_window_mins: int
    data_provenance: Dict[str, Any]
    model_versions: Dict[str, str]
