"""
Diagnostics API routes.
Handles motor diagnosis requests and history management.
"""

import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import DiagnosticRecord
from app.schemas import DiagnosticInput, DiagnosticResponse
from app.engines import RuleBasedDiagnosticEngine, RecommendationEngine

router = APIRouter()

# Initialize engines
diagnostic_engine = RuleBasedDiagnosticEngine()
recommendation_engine = RecommendationEngine()


def _record_to_response(record: DiagnosticRecord) -> DiagnosticResponse:
    """Convert a database record to API response format."""
    return DiagnosticResponse(
        id=record.id,
        timestamp=record.timestamp,
        motor_power=record.motor_power,
        supply_voltage=record.supply_voltage,
        running_current=record.running_current,
        temperature=record.temperature,
        vibration_level=record.vibration_level,
        power_factor=record.power_factor,
        operating_hours=record.operating_hours,
        health_score=record.health_score,
        health_category=record.health_category,
        fault_detected=record.fault_detected,
        severity=record.severity,
        recommendations=json.loads(record.recommendations),
    )


@router.post("/diagnose", response_model=DiagnosticResponse)
def run_diagnosis(input_data: DiagnosticInput, db: Session = Depends(get_db)):
    """
    Run motor fault diagnosis on provided parameters.

    Accepts motor operating parameters and returns:
    - Health score (0-100)
    - Health category (Excellent/Good/Warning/Critical)
    - Detected fault classification
    - Severity level
    - Maintenance recommendations
    """
    # Run diagnostic engine
    result = diagnostic_engine.diagnose(
        motor_power=input_data.motor_power,
        supply_voltage=input_data.supply_voltage,
        running_current=input_data.running_current,
        temperature=input_data.temperature,
        vibration_level=input_data.vibration_level,
        power_factor=input_data.power_factor,
        operating_hours=input_data.operating_hours,
    )

    # Get recommendations
    recommendations = recommendation_engine.get_recommendations(
        result.fault_detected, result.severity
    )

    # Store in database
    record = DiagnosticRecord(
        motor_power=input_data.motor_power,
        supply_voltage=input_data.supply_voltage,
        running_current=input_data.running_current,
        temperature=input_data.temperature,
        vibration_level=input_data.vibration_level,
        power_factor=input_data.power_factor,
        operating_hours=input_data.operating_hours,
        health_score=result.health_score,
        health_category=result.health_category,
        fault_detected=result.fault_detected,
        severity=result.severity,
        recommendations=json.dumps(recommendations),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return _record_to_response(record)


@router.get("/history", response_model=list[DiagnosticResponse])
def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    fault_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Retrieve diagnostic history with optional filtering.

    Parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum records to return
    - fault_type: Filter by fault classification
    """
    query = db.query(DiagnosticRecord).order_by(DiagnosticRecord.timestamp.desc())

    if fault_type:
        query = query.filter(DiagnosticRecord.fault_detected == fault_type)

    records = query.offset(skip).limit(limit).all()
    return [_record_to_response(r) for r in records]


@router.get("/history/{record_id}", response_model=DiagnosticResponse)
def get_diagnosis(record_id: int, db: Session = Depends(get_db)):
    """Get a specific diagnostic record by ID."""
    record = db.query(DiagnosticRecord).filter(DiagnosticRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Diagnostic record not found")
    return _record_to_response(record)


@router.delete("/history/{record_id}")
def delete_diagnosis(record_id: int, db: Session = Depends(get_db)):
    """Delete a specific diagnostic record."""
    record = db.query(DiagnosticRecord).filter(DiagnosticRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Diagnostic record not found")
    db.delete(record)
    db.commit()
    return {"message": "Record deleted successfully"}
