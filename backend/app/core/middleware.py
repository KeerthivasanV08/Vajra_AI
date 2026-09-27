"""
FastAPI Middleware Module for VAJRA Platform.
Handles Request Correlation ID injection (X-Request-ID), structured request logging, and global exception wrapping.
"""

import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import logger

class RequestCorrelationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.time()
        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-MS"] = str(duration_ms)

        # Structured request log
        log_msg = f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)"
        extra = {"request_id": request_id}
        if response.status_code >= 400:
            logger.warning(log_msg, extra=extra)
        else:
            logger.info(log_msg, extra=extra)

        return response
