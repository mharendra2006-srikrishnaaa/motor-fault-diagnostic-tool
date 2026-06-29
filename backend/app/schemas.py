"""
Pydantic schemas for request/response validation.
"""

from datetime import datetime
from pydantic import BaseModel, Field


class DiagnosticInput(BaseModel):
    """Input parameters for motor diagnosis."""

    motor_power: float = Field(..., gt=0, le=1000, description="Motor rated power in kW")
    supply_voltage: float = Field(..., gt=0, le=11000, description="Supply voltage in V")
    running_current: float = Field(..., gt=0, le=2000, description="Running current in A")
    temperature: float = Field(..., ge=20, le=200, description="Motor temperature in °C")
    vibration_level: float = Field(..., ge=0, le=50, description="Vibration level in mm/s")
    power_factor: float = Field(..., ge=0.1, le=1.0, description="Power factor (0-1)")
    operating_hours: float = Field(..., ge=1, le=24, description="Operating hours per day")


class DiagnosticResponse(BaseModel):
    """Complete diagnostic result returned to the client."""

    id: int
    timestamp: datetime
    motor_power: float
    supply_voltage: float
    running_current: float
    temperature: float
    vibration_level: float
    power_factor: float
    operating_hours: float
    health_score: int
    health_category: str
    fault_detected: str
    severity: str
    recommendations: list[str]

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    """Summary statistics for the dashboard."""

    total_diagnostics: int
    average_health_score: float
    fault_distribution: dict[str, int]
    recent_trend: list[dict]
