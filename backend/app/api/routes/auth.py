"""
Auth Routes Module for VAJRA Platform.
Endpoint: POST /api/v1/auth/login
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import TokenRequest, TokenResponse
from app.core.security import create_access_token

router = APIRouter()

@router.post("/auth/login", response_model=TokenResponse, summary="Authenticate user & issue JWT token")
def login(req: TokenRequest):
    # Development prototype login handler
    role = "LEA_OFFICER"
    if "admin" in req.username.lower():
        role = "ADMIN"
    elif "bank" in req.username.lower():
        role = "BANK_OFFICER"

    token = create_access_token({"sub": req.username, "role": role, "user_id": f"USER_{req.username.upper()}"})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "user_id": f"USER_{req.username.upper()}"
    }
