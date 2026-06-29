"""
Statistics API routes.
Provides aggregated data for the dashboard.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import DiagnosticRecord
from app.schemas import StatsResponse

router = APIRouter()


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """
    Get summary statistics for the dashboard.

    Returns:
    - Total number of diagnostics performed
    - Average health score
    - Fault type distribution
    - Recent health score trend (last 10)
    """
    total = db.query(func.count(DiagnosticRecord.id)).scalar() or 0
    avg_score = db.query(func.avg(DiagnosticRecord.health_score)).scalar() or 0

    # Fault distribution
    fault_counts = (
        db.query(DiagnosticRecord.fault_detected, func.count(DiagnosticRecord.id))
        .group_by(DiagnosticRecord.fault_detected)
        .all()
    )
    fault_distribution = {fault: count for fault, count in fault_counts}

    # Recent trend (last 10 diagnostics)
    recent = (
        db.query(DiagnosticRecord)
        .order_by(DiagnosticRecord.timestamp.desc())
        .limit(10)
        .all()
    )
    recent_trend = [
        {
            "id": r.id,
            "timestamp": r.timestamp.isoformat(),
            "health_score": r.health_score,
            "fault_detected": r.fault_detected,
        }
        for r in reversed(recent)
    ]

    return StatsResponse(
        total_diagnostics=total,
        average_health_score=round(avg_score, 1),
        fault_distribution=fault_distribution,
        recent_trend=recent_trend,
    )
