"""
Corridor Routes Module for VAJRA Platform.
Endpoints:
- GET /api/v1/corridors
- GET /api/v1/corridors/hotspots
- GET /api/v1/corridors/{corridor_id}
- GET /api/v1/corridors/{corridor_id}/nodes
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.core.config import settings
from app.repositories.csv_repository import CSVRepository
from app.repositories.node_repository import node_repository
from app.core.sanitizer import sanitize_for_json

router = APIRouter()

corridors_reference_repo = CSVRepository(
    settings.REFERENCE_DATA_ROOT / "corridors" / "corridor_reference.csv",
    primary_key="id"
)

corridor_hubs_repo = CSVRepository(
    settings.RAW_DATA_ROOT / "spatial" / "corridor_hubs.csv",
    primary_key="hub_event_id"
)

CORRIDOR_METRICS = {
    "CORR_001": {
        "start_lat": 28.6139, "start_lon": 77.2090,  # Delhi Central
        "end_lat": 28.4595, "end_lon": 77.0266,      # Gurugram Hub
        "risk_score": 0.92,
        "vulnerability_level": "CRITICAL",
        "primary_nodes_count": 373,
    },
    "CORR_002": {
        "start_lat": 23.9620, "start_lon": 86.8000,  # Jamtara
        "end_lat": 23.7957, "end_lon": 86.4304,      # Dhanbad Hub
        "risk_score": 0.88,
        "vulnerability_level": "CRITICAL",
        "primary_nodes_count": 410,
    },
    "CORR_003": {
        "start_lat": 25.0108, "start_lon": 88.1411,  # English Bazar / Malda
        "end_lat": 24.8110, "end_lon": 88.0338,      # Border Transit
        "risk_score": 0.85,
        "vulnerability_level": "HIGH",
        "primary_nodes_count": 378,
    },
    "CORR_004": {
        "start_lat": 18.9220, "start_lon": 72.8347,  # Mumbai Central
        "end_lat": 19.0330, "end_lon": 73.0297,      # Navi Mumbai Hub
        "risk_score": 0.79,
        "vulnerability_level": "HIGH",
        "primary_nodes_count": 352,
    },
    "CORR_005": {
        "start_lat": 28.1023, "start_lon": 77.0018,  # Nuh Hub
        "end_lat": 27.2152, "end_lon": 77.4539,      # Bharatpur / Alwar
        "risk_score": 0.95,
        "vulnerability_level": "CRITICAL",
        "primary_nodes_count": 368,
    },
}

def _format_corridor(row: dict) -> dict:
    cid = str(row.get("id") or row.get("corridor_id") or "").strip()
    meta = CORRIDOR_METRICS.get(cid, {})
    lat = float(row.get("lat") or 28.6139)
    lon = float(row.get("lon") or 77.2090)

    hub_frame = corridor_hubs_repo.get_all()
    hub_rows = hub_frame[hub_frame["corridor_id"].astype(str) == cid].copy() if not hub_frame.empty and "corridor_id" in hub_frame.columns else hub_frame
    if not hub_rows.empty and "timestamp" in hub_rows.columns:
        hub_rows["timestamp"] = __import__("pandas").to_datetime(hub_rows["timestamp"], errors="coerce")
        hub_rows = hub_rows.sort_values("timestamp")

    latest = hub_rows.iloc[-1].to_dict() if not hub_rows.empty else {}
    latest_intensity = float(latest.get("intensity_score_reference")) if latest.get("intensity_score_reference") not in (None, "") else None
    if latest_intensity is None:
        latest_intensity = float(meta.get("risk_score", 0.0))

    vulnerability = "CRITICAL" if latest_intensity >= 0.9 else "HIGH" if latest_intensity >= 0.75 else "MEDIUM"
    primary_count = int(latest.get("active_mule_count_reference", 0) or meta.get("primary_nodes_count", 0))
    if primary_count <= 0:
        primary_count = int(meta.get("primary_nodes_count", 120))

    return {
        "corridor_id": cid,
        "corridor_name": row.get("name") or row.get("corridor_name") or f"Corridor {cid}",
        "hub_name": row.get("hub_name", ""),
        "state": row.get("state", "Delhi NCR"),
        "district": row.get("city") or row.get("district") or "Central",
        "primary_nodes_count": primary_count,
        "vulnerability_level": vulnerability,
        "risk_score": latest_intensity,
        "start_lat": float(meta.get("start_lat", lat - 0.05)),
        "start_lon": float(meta.get("start_lon", lon - 0.05)),
        "end_lat": float(meta.get("end_lat", lat + 0.05)),
        "end_lon": float(meta.get("end_lon", lon + 0.05)),
        "radius_km": float(row.get("radius_km") or 50.0),
        "description": row.get("description", ""),
        "intensity_score": latest_intensity,
        "last_updated": latest.get("timestamp"),
    }

@router.get("/corridors", summary="Get cash-out corridor hubs & hotspots")
def get_corridors(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=100)):
    items, total = corridors_reference_repo.query(page=page, page_size=page_size)
    formatted = [_format_corridor(item) for item in items]
    return sanitize_for_json({
        "items": formatted,
        "corridors": formatted,
        "total": total,
        "page": page,
        "page_size": page_size
    })

@router.get("/corridors/hotspots", summary="Get high-density cash-out corridor hotspots")
def get_corridor_hotspots():
    df = corridor_hubs_repo.get_all()
    if df.empty:
        return {"hotspots": []}
    hotspots = df.to_dict(orient="records")[:10]
    return sanitize_for_json({"hotspots_count": len(hotspots), "hotspots": hotspots})

@router.get("/corridors/{corridor_id}", summary="Get corridor details by ID")
def get_corridor_by_id(corridor_id: str):
    corr = corridors_reference_repo.find_by_id(corridor_id)
    if not corr:
        raise HTTPException(status_code=404, detail=f"Corridor '{corridor_id}' not found.")
    return sanitize_for_json(_format_corridor(corr))

@router.get("/corridors/{corridor_id}/nodes", summary="Get withdrawal nodes situated along a corridor")
def get_corridor_nodes(corridor_id: str, limit: int = Query(50, ge=1, le=200)):
    df = node_repository.get_all_nodes_df()
    if not df.empty and "corridor_id" in df.columns:
        matched = df[df["corridor_id"] == corridor_id].head(limit)
        nodes_list = matched.to_dict(orient="records")
        return sanitize_for_json({
            "corridor_id": corridor_id,
            "nodes_count": len(nodes_list),
            "nodes": nodes_list
        })
    return {
        "corridor_id": corridor_id,
        "nodes_count": 0,
        "nodes": []
    }
