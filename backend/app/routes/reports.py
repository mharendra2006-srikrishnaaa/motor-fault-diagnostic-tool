"""
Report generation routes.
Generates downloadable PDF diagnostic reports.
"""

import json
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DiagnosticRecord
from app.report_generator import generate_pdf_report

router = APIRouter()


@router.get("/report/{record_id}")
def download_report(record_id: int, db: Session = Depends(get_db)):
    """
    Generate and download a PDF diagnostic report.

    Returns a PDF file containing:
    - Motor details and input parameters
    - Health score and category
    - Detected fault and severity
    - Maintenance recommendations
    - Timestamp
    """
    record = db.query(DiagnosticRecord).filter(DiagnosticRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Diagnostic record not found")

    # Build report data
    report_data = {
        "id": record.id,
        "timestamp": record.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "motor_power": record.motor_power,
        "supply_voltage": record.supply_voltage,
        "running_current": record.running_current,
        "temperature": record.temperature,
        "vibration_level": record.vibration_level,
        "power_factor": record.power_factor,
        "operating_hours": record.operating_hours,
        "health_score": record.health_score,
        "health_category": record.health_category,
        "fault_detected": record.fault_detected,
        "severity": record.severity,
        "recommendations": json.loads(record.recommendations),
    }

    # Generate PDF
    pdf_buffer = generate_pdf_report(report_data)

    return StreamingResponse(
        BytesIO(pdf_buffer),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=motor_diagnostic_report_{record_id}.pdf"
        },
    )
