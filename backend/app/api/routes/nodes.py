"""
Node Routes Module for VAJRA Platform.
Endpoints:
- GET /api/v1/nodes
- GET /api/v1/nodes/{node_id}
- GET /api/v1/nodes/{node_id}/risk
- GET /api/v1/nodes/{node_id}/history
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
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
