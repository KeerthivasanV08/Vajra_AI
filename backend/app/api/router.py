"""
Central API v1 Router for VAJRA Platform.
Registers all route modules under /api/v1.
"""

from fastapi import APIRouter
from app.api.routes import (
    health, auth, prediction, nodes, corridors,
    sop, dispatch, legal_dossier, audit, fairness,
    syndicate, simulation, metrics, reports, vajra, mule_ring, field
)

api_router = APIRouter()

# Core system routes
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, tags=["Authentication"])

# VAJRA prediction pipeline routes
api_router.include_router(prediction.router, tags=["Physical Prediction"])
api_router.include_router(nodes.router, tags=["Withdrawal Nodes"])
api_router.include_router(corridors.router, tags=["Corridors & Hotspots"])

# SOP + operations
api_router.include_router(sop.router, tags=["SOP Fusion Engine"])
api_router.include_router(dispatch.router, tags=["PCR & Bank Dispatch"])
api_router.include_router(legal_dossier.router, tags=["Legal Dossier"])

# Governance + intelligence
api_router.include_router(audit.router, tags=["Cryptographic Audit Chain"])
api_router.include_router(fairness.router, tags=["Fairness & Governance Audit"])
api_router.include_router(syndicate.router, tags=["Syndicate Fingerprint Matcher"])
api_router.include_router(mule_ring.router, tags=["Mule Ring Investigation"])
api_router.include_router(field.router, tags=["Beat Officer Field Operations"])

# Simulation + metrics + reports
api_router.include_router(simulation.router, tags=["Attack Simulation"])
api_router.include_router(metrics.router, tags=["Model Metrics & Validation"])
api_router.include_router(reports.router, tags=["Compliance Reports"])

# Master orchestrator
api_router.include_router(vajra.router, tags=["VAJRA Master Orchestrator"])
