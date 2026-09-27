"""
Common Pydantic Schemas Module for VAJRA Platform.
Standard response envelopes, pagination, and error representations.
"""

from typing import Generic, TypeVar, Optional, List, Any
from pydantic import BaseModel, Field

T = TypeVar("T")

class BaseResponseEnvelope(BaseModel, Generic[T]):
    success: bool = Field(True, description="Success status flag")
    message: str = Field("Success", description="Human readable message")
    data: Optional[T] = Field(None, description="Response payload")
    request_id: Optional[str] = Field(None, description="Correlation Request ID")

class PaginationMeta(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(50, ge=1, le=100)
    total_items: int = Field(0, ge=0)
    total_pages: int = Field(0, ge=0)

class PaginatedResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    items: List[T] = []
    meta: PaginationMeta

class ErrorDetailSchema(BaseModel):
    error: str = Field(..., description="Error code")
    message: str = Field(..., description="Error message detail")
    request_id: Optional[str] = None
    timestamp: Optional[str] = None
