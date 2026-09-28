from __future__ import annotations

from functools import lru_cache
from fastapi import APIRouter, HTTPException, Query

from app.services.transaction.graph_feature_service import GraphFeatureService

router = APIRouter(tags=["Graph"])


@lru_cache(maxsize=1)
def get_graph_service() -> GraphFeatureService:
    return GraphFeatureService()


@router.get("/network")
async def network(limit: int = Query(75, ge=1, le=500)):
    return get_graph_service().get_network(limit=limit)


@router.get("/account/{account_id}")
async def account_network(account_id: str, depth: int = Query(2, ge=1, le=4)):
    result = get_graph_service().get_account_graph(account_id, depth=depth)
    if not result.get("nodes") and result.get("graph_status") != "UNAVAILABLE":
        raise HTTPException(status_code=404, detail="Account graph not found")
    return result


@router.get("/risk/{account_id}")
async def account_risk(account_id: str):
    return get_graph_service().get_risk_summary(account_id)


@router.get("/layering/{account_id}")
async def account_layering(account_id: str):
    return get_graph_service().get_layering_summary(account_id)


@router.get("/community/{account_id}")
async def account_community(account_id: str):
    return get_graph_service().get_community_summary(account_id)