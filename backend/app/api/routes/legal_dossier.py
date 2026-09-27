"""
Legal Dossier Routes Module for VAJRA Platform.
Endpoints:
- POST /api/v1/legal-dossier/generate
- GET /api/v1/legal-dossier/{dossier_id}/pdf
"""

from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.responses import Response
from app.schemas.legal import GenerateDossierRequest, GenerateDossierResponse
from app.services.legal.legal_dossier_service import legal_dossier_service
from app.core.security import get_current_user

router = APIRouter()

@router.post("/legal-dossier/generate", response_model=GenerateDossierResponse, summary="Generate structured Legal Dossier PDF with evidence hash")
def generate_dossier(req: GenerateDossierRequest, user: dict = Depends(get_current_user)):
    officer_id = user.get("user_id", "OFFICER_001_DEFAULT")
    return legal_dossier_service.generate_dossier(
        case_id=req.case_id,
        prediction_data=req.prediction_data,
        sop_data=req.sop_data,
        officer_id=officer_id,
        complaint_data=req.complaint_data
    )

@router.get("/legal-dossier/{dossier_id}/pdf", summary="Download compiled Legal Dossier PDF document")
def download_dossier_pdf(dossier_id: str):
    pdf_bytes = legal_dossier_service.get_dossier_bytes(dossier_id)
    if not pdf_bytes:
        raise HTTPException(status_code=404, detail=f"Legal dossier PDF '{dossier_id}' not found.")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=VAJRA_DOSSIER_{dossier_id}.pdf"}
    )
