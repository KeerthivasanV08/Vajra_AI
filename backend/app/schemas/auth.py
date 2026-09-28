"""
Auth Schemas Module for VAJRA Platform.
"""

from pydantic import BaseModel, Field

class TokenRequest(BaseModel):
    username: str = Field(..., example="officer_delhi")
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
