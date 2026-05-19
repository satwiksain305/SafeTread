import os
import tempfile
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage


def generate_pdf_report(prediction_data, image_path, heatmap_path=None, output_dir=None):
    """Generate inspection PDF report and return the generated file path."""
    if not prediction_data:
        raise ValueError("prediction_data is required")
    if not image_path or not os.path.exists(image_path):
        raise ValueError("Valid image_path is required")

    report_dir = output_dir or tempfile.mkdtemp(prefix="safetread_report_")
    os.makedirs(report_dir, exist_ok=True)
    pdf_path = os.path.join(report_dir, "inspection_report.pdf")

    doc = SimpleDocTemplate(pdf_path, pagesize=A4, rightMargin=2 * cm, leftMargin=2 * cm, topMargin=1.5 * cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("SafeTreadTitle", parent=styles["Title"], fontSize=18, textColor=colors.HexColor("#1f2937"))
    section_style = ParagraphStyle("SafeTreadSection", parent=styles["Heading3"], textColor=colors.HexColor("#111827"))

    story = []
    story.append(Paragraph("SafeTread AI Tire Inspection Report", title_style))
    story.append(Spacer(1, 10))

    table_data = [
        ["Date", prediction_data.get("date", "")],
        ["Time", prediction_data.get("time", "")],
        ["User Email", prediction_data.get("user_email", "")],
        ["Detection Status", prediction_data.get("detection_status", "")],
        ["Prediction Result", prediction_data.get("prediction_result", "")],
        ["Health Score", f"{prediction_data.get('health_score', 0)}"],
        ["Confidence Score", f"{prediction_data.get('confidence_score', 0)}%"],
        ["Recommendation", prediction_data.get("recommendation", "")],
    ]

    table = Table(table_data, colWidths=[5 * cm, 10 * cm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#111827")),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.whitesmoke, colors.white]),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("Uploaded Tire Image", section_style))
    story.append(Spacer(1, 4))
    story.append(RLImage(image_path, width=15 * cm, height=8 * cm))
    story.append(Spacer(1, 12))

    if heatmap_path and os.path.exists(heatmap_path):
        story.append(Paragraph("Explainability Heatmap (Grad-CAM)", section_style))
        story.append(Spacer(1, 4))
        story.append(RLImage(heatmap_path, width=15 * cm, height=8 * cm))

    doc.build(story)
    return pdf_path
