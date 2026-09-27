"""
Node Routes Module for VAJRA Platform.
Endpoints:
- GET /api/v1/nodes
- GET /api/v1/nodes/{node_id}
- GET /api/v1/nodes/{node_id}/risk
- GET /api/v1/nodes/{node_id}/history
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Depends
import pandas as pd
from io import BytesIO
from app.core.security import get_current_user
from app.services.audit.audit_chain_service import audit_chain_service
from app.repositories.node_repository import node_repository
from app.services.vajra.node_vulnerability_service import node_vulnerability_service

from app.core.sanitizer import sanitize_for_json

router = APIRouter()

@router.get("/nodes", summary="Query withdrawal nodes with filtering & pagination")
def get_nodes(
    node_type: Optional[str] = None,
    bank: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    risk_min: Optional[float] = None,
    risk_max: Optional[float] = None,
    risk_band: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100)
):
    items, total = node_repository.query_nodes(
        node_type=node_type,
        bank=bank,
        district=district,
        state=state,
        risk_min=risk_min,
        risk_max=risk_max,
        risk_band=risk_band,
        search=search,
        page=page,
        page_size=page_size
    )
    return sanitize_for_json({
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    })

@router.get("/nodes/{node_id}", summary="Get withdrawal node details by node_id")
def get_node_by_id(node_id: str):
    node = node_repository.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    return node

@router.get("/nodes/{node_id}/risk", summary="Get Model 2 vulnerability risk score for a node")
def get_node_risk(node_id: str):
    node = node_repository.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    risk_score = node_vulnerability_service.predict_node_vulnerability(node)
    return {
        "node_id": node_id,
        "vulnerability_score": risk_score,
        "risk_band": "HIGH" if risk_score >= 0.70 else ("MEDIUM" if risk_score >= 0.40 else "LOW"),
        "model_version": "Model 2 v1.0 (XGBRegressor)"
    }


@router.post("/nodes/bulk-import")
async def bulk_import_nodes(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=415, detail="A CSV file is required")
    try:
        frame = pd.read_csv(BytesIO(await file.read()))
        result = node_repository.bulk_import(frame)
    except (ValueError, pd.errors.ParserError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    audit_chain_service.append_event("NODE_BULK_IMPORTED", "NODE_REGISTRY", result, user.get("user_id", "OFFICER_001_DEFAULT"))
    return result


@router.post("/nodes/{node_id}/recalculate-vulnerability")
def recalculate_vulnerability(node_id: str, user: dict = Depends(get_current_user)):
    node = node_repository.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    score = node_vulnerability_service.predict_node_vulnerability(node)
    updated = node_repository.update_vulnerability(node_id, score)
    audit_chain_service.append_event("NODE_VULNERABILITY_RECALCULATED", node_id, {"node_id": node_id, "vulnerability_score": score}, user.get("user_id", "OFFICER_001_DEFAULT"))
    return {"node": updated or node, "vulnerability_score": score, "risk_band": "HIGH" if score >= 0.70 else ("MEDIUM" if score >= 0.40 else "LOW")}

@router.get("/nodes/{node_id}/history", summary="Get historical cash-out events for a node")
def get_node_history(node_id: str):
    node = node_repository.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found.")
    return {
        "node_id": node_id,
        "historical_txn_volume": node.get("historical_txn_volume", 0),
        "historical_cashout_count": node.get("historical_cash_withdrawals", 0),
        "historical_fraud_cashouts": node.get("historical_fraud_cashouts", 0),
        "off_hour_withdrawal_ratio": node.get("off_hour_withdrawal_ratio", 0.0)
    }
