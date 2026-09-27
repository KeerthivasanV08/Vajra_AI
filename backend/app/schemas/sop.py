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
    calibration_trained: bool = False
    calibration_message: str = ""


class SOPSimulationRequest(BaseModel):
    digital: float = Field(..., ge=0.0, le=1.0)
    physical: float = Field(..., ge=0.0, le=1.0)
    context: float = Field(..., ge=0.0, le=1.0)
    cross_border_override: bool = False


class SOPFusionResponse(BaseModel):
    raw_score: float
    calibrated_score: float
    tier: str
    contributions: Dict[str, float]
    cross_border_override: bool = False
    action_description: str = ""
    legal_authority_disclaimer: str = ""
    case_id: Optional[str] = None
    calculated_at: Optional[str] = None
    calibration_trained: bool = False
    calibration_message: str = ""
