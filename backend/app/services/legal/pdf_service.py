"""
PDF Generation Service Module for VAJRA Platform.
Compiles official Legal Dossier PDF files using ReportLab with safe byte fallback.
"""

from io import BytesIO
from typing import Dict, Any

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

class PDFService:
    def generate_dossier_pdf(self, dossier_data: Dict[str, Any]) -> bytes:
        """Generate PDF binary content for legal dossier."""
        if REPORTLAB_AVAILABLE:
            try:
                buffer = BytesIO()
                doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
                styles = getSampleStyleSheet()

                title_style = ParagraphStyle(
                    'TitleStyle',
                    parent=styles['Heading1'],
                    fontSize=16,
                    leading=20,
                    textColor=colors.HexColor('#1a365d'),
                    alignment=1
                )

                h2_style = ParagraphStyle(
                    'H2Style',
                    parent=styles['Heading2'],
                    fontSize=12,
                    leading=16,
                    textColor=colors.HexColor('#2b6cb0'),
                    spaceBefore=10,
                    spaceAfter=4
                )

                normal_style = styles['Normal']

                elements = []

                # Header Title
                elements.append(Paragraph("<b>VAJRA — PREDICTIVE CYBERCRIME LEGAL DOSSIER</b>", title_style))
                elements.append(Paragraph("<b>CONFIDENTIAL — FOR LAWFUL LEA / BANK USE ONLY</b>", ParagraphStyle('Sub', parent=normal_style, alignment=1, textColor=colors.red)))
                elements.append(Spacer(1, 12))

                # Section A: Summary & Identifiers
                elements.append(Paragraph("<b>Section A: Dossier Metadata</b>", h2_style))
                meta_table_data = [
                    ["Dossier ID:", dossier_data.get("dossier_id", "N/A")],
                    ["Case ID / Complaint ID:", dossier_data.get("case_id", "N/A")],
                    ["Generated Timestamp:", dossier_data.get("generated_at", "N/A")],
                    ["Officer:", dossier_data.get("officer_id", "N/A")],
                    ["Evidence SHA-256:", dossier_data.get("evidence_hash", "N/A")[:32] + "..."]
                ]
                t = Table(meta_table_data, colWidths=[150, 350])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#edf2f7')),
                    ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e0')),
                    ('FONTSIZE', (0,0), (-1,-1), 9),
                ]))
                elements.append(t)
                elements.append(Spacer(1, 10))

                # Section B: Physical Prediction & SOP Action
                elements.append(Paragraph("<b>Section B: Physical Prediction & SOP Action Recommendation</b>", h2_style))
                pred = dossier_data.get("prediction", {})
                sop = dossier_data.get("sop_decision", {})

                sop_tier = sop.get("sop_tier", "N/A")
                top_node = pred.get("top_prediction", {})

                sop_table_data = [
                    ["SOP Action Tier:", sop_tier],
                    ["Predicted Region:", pred.get("predicted_region", "N/A")],
                    ["Top Cash-Out Node:", f"{top_node.get('node_id', 'N/A')} ({top_node.get('bank_or_aggregator', '')})"],
                    ["Node Location:", f"Lat: {top_node.get('latitude', '')}, Lon: {top_node.get('longitude', '')}"],
                    ["Physical Score:", str(pred.get("physical_prediction_score", "N/A"))]
                ]
                t2 = Table(sop_table_data, colWidths=[150, 350])
                t2.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#feebc8')),
                    ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e0')),
                    ('FONTSIZE', (0,0), (-1,-1), 9),
                ]))
                elements.append(t2)
                elements.append(Spacer(1, 12))

                # Disclaimer
                elements.append(Paragraph("<b>PROTOTYPE DISCLAIMER:</b> All ML prediction scores, node rankings, and SOP tiers are generated for defensive operational support. Actual account freeze or coercive LEA action requires authorized legal directives.", ParagraphStyle('Disc', parent=normal_style, fontSize=8, textColor=colors.gray)))

                doc.build(elements)
                return buffer.getvalue()
            except Exception:
                pass

        # Fallback raw byte string representation
        text_content = f"""
============================================================
VAJRA PREDICTIVE CYBERCRIME LEGAL DOSSIER
CONFIDENTIAL — FOR LAWFUL LEA / BANK USE ONLY
============================================================

Dossier ID: {dossier_data.get('dossier_id')}
Case ID: {dossier_data.get('case_id')}
Generated At: {dossier_data.get('generated_at')}
Officer ID: {dossier_data.get('officer_id')}
Evidence SHA-256: {dossier_data.get('evidence_hash')}

SOP Action Tier: {dossier_data.get('sop_decision', {}).get('sop_tier')}
Predicted Region: {dossier_data.get('prediction', {}).get('predicted_region')}
Physical Prediction Score: {dossier_data.get('prediction', {}).get('physical_prediction_score')}

DISCLAIMER: All predictions are operational recommendations.
============================================================
"""
        return text_content.encode("utf-8")

pdf_service = PDFService()
