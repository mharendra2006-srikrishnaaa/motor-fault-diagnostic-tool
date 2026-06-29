"""
PDF Report Generator Module
Creates professional diagnostic reports using ReportLab.
"""

from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT


def generate_pdf_report(data: dict) -> bytes:
    """
    Generate a professional PDF diagnostic report.

    Args:
        data: Dictionary containing all diagnostic information

    Returns:
        PDF file content as bytes
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=colors.HexColor("#1e40af"),
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "CustomSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.grey,
        alignment=TA_CENTER,
        spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#1e40af"),
        spaceBefore=15,
        spaceAfter=8,
    )
    normal_style = styles["Normal"]

    elements = []

    # Title
    elements.append(Paragraph("Motor Fault Diagnostic Report", title_style))
    elements.append(Paragraph(f"Report ID: #{data['id']} | Generated: {data['timestamp']}", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1e40af")))
    elements.append(Spacer(1, 10))

    # Health Summary
    elements.append(Paragraph("Health Summary", heading_style))

    health_color = colors.green
    if data["health_category"] == "Warning":
        health_color = colors.orange
    elif data["health_category"] == "Critical":
        health_color = colors.red

    summary_data = [
        ["Health Score", f"{data['health_score']} / 100"],
        ["Category", data["health_category"]],
        ["Fault Detected", data["fault_detected"]],
        ["Severity", data["severity"]],
    ]
    summary_table = Table(summary_data, colWidths=[150, 300])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#f1f5f9")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#334155")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 10))

    # Input Parameters
    elements.append(Paragraph("Motor Operating Parameters", heading_style))

    params_data = [
        ["Parameter", "Value", "Unit"],
        ["Motor Rated Power", str(data["motor_power"]), "kW"],
        ["Supply Voltage", str(data["supply_voltage"]), "V"],
        ["Running Current", str(data["running_current"]), "A"],
        ["Temperature", str(data["temperature"]), "°C"],
        ["Vibration Level", str(data["vibration_level"]), "mm/s"],
        ["Power Factor", str(data["power_factor"]), "—"],
        ["Operating Hours/Day", str(data["operating_hours"]), "hrs"],
    ]
    params_table = Table(params_data, colWidths=[180, 150, 80])
    params_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e40af")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    elements.append(params_table)
    elements.append(Spacer(1, 10))

    # Recommendations
    elements.append(Paragraph("Maintenance Recommendations", heading_style))

    for i, rec in enumerate(data["recommendations"], 1):
        elements.append(Paragraph(f"{i}. {rec}", normal_style))
        elements.append(Spacer(1, 3))

    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.grey))
    elements.append(Spacer(1, 5))

    footer_style = ParagraphStyle(
        "Footer",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER,
    )
    elements.append(Paragraph(
        "Motor Fault Diagnostic Tool v1.0 | Generated automatically | "
        "For engineering reference only",
        footer_style,
    ))

    # Build PDF
    doc.build(elements)
    return buffer.getvalue()
