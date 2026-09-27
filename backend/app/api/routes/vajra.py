"""
Master VAJRA Orchestration Routes Module.
Endpoint: POST /api/v1/vajra/analyze
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from app.services.vajra.vajra_orchestrator import vajra_orchestrator
from app.core.security import get_current_user

router = APIRouter()

class VajraAnalyzeRequest(BaseModel):
    account_id: str = Field(..., example="ACC_1001_MULE")
    geo_lat: float = Field(..., ge=-90.0, le=90.0, example=28.6139)
    geo_lon: float = Field(..., ge=-180.0, le=180.0, example=77.2090)
    session_data: Optional[Dict[str, Any]] = None
    complaint_context: Optional[Dict[str, Any]] = None

@router.post("/vajra/analyze", summary="Execute master end-to-end VAJRA cybercrime cash-out interception pipeline")
def analyze_vajra_case(req: VajraAnalyzeRequest, user: dict = Depends(get_current_user)):
    officer_id = user.get("user_id", "OFFICER_001_DEFAULT")
    return vajra_orchestrator.run_vajra_case(
        account_id=req.account_id,
        geo_lat=req.geo_lat,
        geo_lon=req.geo_lon,
        session_data=req.session_data,
        complaint_context=req.complaint_context,
        officer_id=officer_id
    )
