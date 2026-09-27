from typing import Optional, Literal
from pydantic import BaseModel, Field


FieldStatus = Literal["EN_ROUTE", "ON_SITE", "ACTION_TAKEN"]
Outcome = Literal["intercepted", "missed", "false_alarm"]


class FieldStatusRequest(BaseModel):
    status: FieldStatus
    gps_lat: Optional[float] = Field(None, ge=-90, le=90)
    gps_lon: Optional[float] = Field(None, ge=-180, le=180)
    notes: str = ""
    idempotency_key: Optional[str] = Field(None, min_length=8, max_length=128)


class FieldOutcomeRequest(BaseModel):
    outcome: Outcome
    actual_cashout_confirmed: bool
    notes: str = ""
    actual_action_taken: Optional[str] = None
