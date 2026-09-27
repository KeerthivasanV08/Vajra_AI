"""
Syndicate Schemas Module for VAJRA Platform.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SyndicateMatchRequest(BaseModel):
    account_id: Optional[str] = None
    hop_count: int = Field(3, ge=1)
    fan_out_factor: float = Field(2.5, ge=1.0)
    layering_time_mins: float = Field(15.0, ge=0.0)
    average_interhop_velocity_mins: float = Field(5.0, ge=0.0)
    terminal_node_risk_reference: float = Field(0.75, ge=0.0, le=1.0)

class TagInfo(BaseModel):
    tag: str
    investigative_only: bool = True

class SyndicateMatchResponse(BaseModel):
    account_id: Optional[str] = ""
    matched_pattern_type: str
    pattern_name: Optional[str] = None
    match_confidence: float
    confidence: Optional[float] = None
    top_matches: List[Dict[str, Any]] = []
    matched_tags: List[TagInfo] = []
    summary: Optional[str] = ""
    investigative_only: bool = True
    disclaimer: str
