"""
Legal Dossier Schemas Module for VAJRA Platform.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class GenerateDossierRequest(BaseModel):
    case_id: str = Field(..., description="Target case ID")
    prediction_data: Dict[str, Any] = Field(..., description="Physical prediction outcome")
    sop_data: Dict[str, Any] = Field(..., description="SOP decision outcome")
    complaint_data: Optional[Dict[str, Any]] = None

class GenerateDossierResponse(BaseModel):
    dossier_id: str
    case_id: str
    generated_at: str
    officer_id: str
    evidence_hash: str
    document_hash: str
    audit_event_id: str
    download_url: str
