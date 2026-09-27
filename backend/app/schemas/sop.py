"""
SOP Fusion Schemas Module for VAJRA Platform.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SOPEvaluationRequest(BaseModel):
    digital_risk_score: float = Field(..., ge=0.0, le=1.0)
    physical_prediction_score: float = Field(..., ge=0.0, le=1.0)
    context_score: Optional[float] = Field(0.50, ge=0.0, le=1.0)
    imminent_overseas_shift: Optional[bool] = False
    cross_border_risk_score: Optional[float] = Field(0.0, ge=0.0, le=1.0)

class SOPEvaluationResponse(BaseModel):
    raw_fusion_score: float
    calibrated_score: float
    sop_tier: str
    action_description: str
    cross_border_override: bool
    fusion_weights: Dict[str, float]
    explanations: List[str]
    legal_authority_disclaimer: str
    model_version: str
