"""
SQLAlchemy ORM models for the diagnostic database.
"""

from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class DiagnosticRecord(Base):
    """Stores each diagnostic analysis result."""

    __tablename__ = "diagnostics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, server_default=func.now(), nullable=False)

    # Input parameters
    motor_power = Column(Float, nullable=False)
    supply_voltage = Column(Float, nullable=False)
    running_current = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    vibration_level = Column(Float, nullable=False)
    power_factor = Column(Float, nullable=False)
    operating_hours = Column(Float, nullable=False)

    # Diagnostic results
    health_score = Column(Integer, nullable=False)
    health_category = Column(String, nullable=False)
    fault_detected = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    recommendations = Column(String, nullable=False)  # JSON string
