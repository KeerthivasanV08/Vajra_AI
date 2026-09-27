"""
Security & Authentication Module for VAJRA Platform.
Provides JWT token creation, verification, password hashing, and Role-Based Access Control (RBAC).
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.exceptions import UnauthorizedActionError

security_bearer = HTTPBearer(auto_error=False)

# Supported Roles
ROLES = {
    "ADMIN": "System Administrator",
    "AML_ANALYST": "AML Analyst",
    "LEA_OFFICER": "Law Enforcement Agency Officer",
    "BANK_OFFICER": "Bank Nodal Officer",
    "SUPERVISOR": "Operations Supervisor",
    "AUDITOR": "Compliance Auditor"
}

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "jti": str(uuid.uuid4())})
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Dict[str, Any]:
    """Dependency to retrieve current user from Bearer token, or fallback to prototype officer identity."""
    if not credentials:
        # Development fallback officer
        return {
            "user_id": "OFFICER_001_DEFAULT",
            "username": "proto_officer",
            "role": "LEA_OFFICER",
            "name": "Nodal Officer (Prototype)",
            "unit": "Cyber Crime Division"
        }
    payload = decode_access_token(credentials.credentials)
    return payload

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = user.get("role", "LEA_OFFICER")
        if user_role not in self.allowed_roles and "ADMIN" not in user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{user_role}' is not authorized for this operation. Allowed: {self.allowed_roles}"
            )
        return user