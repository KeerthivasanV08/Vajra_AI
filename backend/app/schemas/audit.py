"""
Audit Schemas Module for VAJRA Platform.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AuditEventSchema(BaseModel):
    event_id: str
    timestamp: str
    officer_id: str
    action_type: str
    target_entity: str
    payload_hash: str
    previous_hash: str
    event_hash: str

class ReverifyAuditResponse(BaseModel):
    verified: bool
    events_checked: int
    first_invalid_event: Optional[str] = None
    failure_reason: Optional[str] = None
