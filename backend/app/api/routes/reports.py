"""
Reports Routes Module for VAJRA Platform.
Endpoints:
- GET /api/v1/reports/list
- GET /api/v1/reports/{report_type}
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/reports/list", summary="List available compliance and intelligence reports")
def list_reports():
    return {
        "reports": [
            "SAR (Suspicious Activity Report)",
            "STR (Suspicious Transaction Report)",
            "EDD (Enhanced Due Diligence)",
            "Mule Network Report",
            "Spatial Interception Report",
            "Predictive Cash-Out Report",
            "SOP Action Report",
            "Audit Chain Report"
        ]
    }

@router.get("/reports/{report_type}", summary="Generate report metadata")
def get_report(report_type: str):
    return {
        "report_type": report_type,
        "status": "GENERATED",
        "format": "JSON/PDF",
        "data_provenance": "synthetic"
    }
