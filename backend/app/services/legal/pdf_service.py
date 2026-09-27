"""
PDF Generation Service Module for VAJRA Platform.
Compiles official Legal Dossier PDF files using ReportLab with safe byte fallback.
"""

from io import BytesIO
import json
from typing import Dict, Any
from xml.sax.saxutils import escape

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
                evidence_style = ParagraphStyle(
                    'EvidenceStyle',
                    parent=normal_style,
                    fontName='Courier',
                    fontSize=6,
                    leading=8,
                    wordWrap='CJK',
                )

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

                def append_data_section(title: str, value: Dict[str, Any]) -> None:
                    elements.append(Paragraph(f"<b>{escape(title)}</b>", h2_style))
                    serialized = json.dumps(value, ensure_ascii=False, indent=2, default=str)
                    for line in serialized.splitlines():
                        elements.append(Paragraph(escape(line) or " ", evidence_style))
                    elements.append(Spacer(1, 8))

                append_data_section("Section B: Case Summary", dossier_data.get("case_summary", {}))
                append_data_section("Section C: Observed Complaint / Case Evidence", dossier_data.get("complaint", {}))
                append_data_section("Section D: Model Prediction Context", dossier_data.get("prediction", {}))
                append_data_section("Section E: SOP Decision Context", dossier_data.get("sop_decision", {}))
                append_data_section("Section F: Data Provenance", dossier_data.get("data_provenance", {}))

                # Summary table for linked prediction/SOP fields.
                elements.append(Paragraph("<b>Prediction & SOP Summary</b>", h2_style))
                pred = dossier_data.get("prediction", {})
                sop = dossier_data.get("sop_decision", {})

                sop_tier = sop.get("sop_tier", "N/A")
                top_node = pred.get("top_prediction", {})
                if not isinstance(top_node, dict):
                    top_node = {}

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

        raise RuntimeError("ReportLab is unavailable; PDF generation cannot proceed safely")

pdf_service = PDFService()
