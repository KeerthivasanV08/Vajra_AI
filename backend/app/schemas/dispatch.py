"""
Dispatch Schemas Module for VAJRA Platform.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class PCRDispatchRequest(BaseModel):
    case_id: str = Field(..., description="Case or complaint reference ID")
    prediction_id: str = Field(..., description="Physical prediction reference ID")
    target_node_id: str = Field(..., description="Target withdrawal node ID")
    target_lat: float = Field(..., ge=-90.0, le=90.0)
    target_lon: float = Field(..., ge=-180.0, le=180.0)

class BankStepUpRequest(BaseModel):
    account_id: str = Field(..., description="Target bank account ID")
    case_id: str = Field(..., description="Case or complaint reference ID")

class DispatchResponse(BaseModel):
    dispatch_id: str
    action_type: str
    status: str
    timestamp: str
    mock_mode: bool
