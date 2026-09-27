"""
Syndicate Routes Module for VAJRA Platform.
Endpoints:
- POST /api/v1/syndicate/match
- GET /api/v1/syndicate/patterns
"""

from fastapi import APIRouter
from app.schemas.syndicate import SyndicateMatchRequest, SyndicateMatchResponse
from app.services.vajra.syndicate_service import syndicate_service

router = APIRouter()

@router.post("/syndicate/match", response_model=SyndicateMatchResponse, summary="Match transaction network pattern against syndicate fingerprint centroids")
def match_syndicate_fingerprint(req: SyndicateMatchRequest):
    return syndicate_service.match_syndicate_fingerprint(req.dict())

@router.get("/syndicate/patterns", summary="List known syndicate fingerprint patterns")
def list_syndicate_patterns():
    return {
        "patterns_count": 4,
        "patterns": [
            {"pattern_type": "RAPID_MULE_FANOUT", "description": "High fan-out multi-branch splitting"},
            {"pattern_type": "CROSS_BORDER_FLIGHT", "description": "VPN transition with imminent overseas withdrawal"},
            {"pattern_type": "ATM_CLUSTER_SWARM", "description": "Coordinated cash-out across local 5km ATM cluster"},
            {"pattern_type": "DORMANT_ACCOUNT_DRAIN", "description": "Rapid drain of reactivated dormant account"}
        ]
    }
