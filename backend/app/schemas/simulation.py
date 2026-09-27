"""
Simulation Schemas Module for VAJRA Platform.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class LiveAttackSimulationRequest(BaseModel):
    victim_account_id: Optional[str] = Field("ACC_VICTIM_999", description="Victim bank account ID")
    mule_chain: Optional[List[str]] = Field(["ACC_MULE_101", "ACC_MULE_102", "ACC_MULE_103"])
    initial_amount_inr: Optional[float] = Field(250000.0, ge=0.0)
    origin_lat: Optional[float] = Field(28.6139, ge=-90.0, le=90.0)
    origin_lon: Optional[float] = Field(77.2090, ge=-180.0, le=180.0)

class LiveAttackSimulationResponse(BaseModel):
    simulation_id: str
    simulation: bool = True
    victim_account_id: str
    mule_chain: List[str]
    initial_amount_inr: float
    digital_analysis: Dict[str, Any]
    physical_prediction: Dict[str, Any]
    cross_border_analysis: Dict[str, Any]
    sop_decision: Dict[str, Any]
    dispatch_recommendation: Dict[str, Any]
    audit_event: Dict[str, Any]
    performance_metrics: Dict[str, float]
