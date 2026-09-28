"""
Simulation Routes Module for VAJRA Platform.
Endpoint: POST /api/v1/simulation/live-attack
"""

from fastapi import APIRouter
from app.schemas.simulation import LiveAttackSimulationRequest, LiveAttackSimulationResponse
from app.services.vajra.simulation_service import simulation_service

router = APIRouter()

@router.post("/simulation/live-attack", response_model=LiveAttackSimulationResponse, summary="Execute end-to-end multi-hop live attack simulation")
def run_live_attack_simulation(req: LiveAttackSimulationRequest):
    return simulation_service.run_live_attack_simulation(
        victim_account_id=req.victim_account_id or "ACC_VICTIM_999",
        mule_chain=req.mule_chain,
        initial_amount_inr=req.initial_amount_inr or 250000.0,
        origin_lat=req.origin_lat or 28.6139,
        origin_lon=req.origin_lon or 77.2090,
        session_data=req.session_data,
    )
