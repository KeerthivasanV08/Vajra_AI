"""
Legal Dossier Schemas Module for VAJRA Platform.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class GenerateDossierRequest(BaseModel):
    case_id: str = Field(..., description="Target case ID")
    prediction_data: Dict[str, Any] = Field(default_factory=dict, description="Optional existing physical prediction context")
    sop_data: Dict[str, Any] = Field(default_factory=dict, description="Optional existing SOP decision context")
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
    version: int = 1
    status: str = "READY"
    integrity_status: str = "VERIFIED"
    case_summary: Dict[str, Any] = Field(default_factory=dict)
    complaint: Dict[str, Any] = Field(default_factory=dict)
    prediction: Dict[str, Any] = Field(default_factory=dict)
    sop_decision: Dict[str, Any] = Field(default_factory=dict)
    data_provenance: Dict[str, Any] = Field(default_factory=dict)
