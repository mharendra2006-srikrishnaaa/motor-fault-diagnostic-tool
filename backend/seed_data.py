"""
Seed script to populate the database with sample diagnostic records.
Run this once to generate demo data for the dashboard.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json
from datetime import datetime, timedelta
from app.database import engine, Base, SessionLocal
from app.models import DiagnosticRecord
from app.engines import RuleBasedDiagnosticEngine, RecommendationEngine

# Create tables
Base.metadata.create_all(bind=engine)

# Sample motor scenarios
SAMPLE_DATA = [
    # Healthy motors
    {"motor_power": 7.5, "supply_voltage": 415, "running_current": 14.0, "temperature": 55, "vibration_level": 2.1, "power_factor": 0.88, "operating_hours": 8},
    {"motor_power": 15, "supply_voltage": 415, "running_current": 27.5, "temperature": 60, "vibration_level": 3.0, "power_factor": 0.90, "operating_hours": 12},
    {"motor_power": 5.5, "supply_voltage": 415, "running_current": 10.2, "temperature": 50, "vibration_level": 1.8, "power_factor": 0.87, "operating_hours": 6},
    # Bearing wear
    {"motor_power": 11, "supply_voltage": 415, "running_current": 19.5, "temperature": 65, "vibration_level": 6.5, "power_factor": 0.86, "operating_hours": 16},
    {"motor_power": 22, "supply_voltage": 415, "running_current": 38.0, "temperature": 70, "vibration_level": 8.2, "power_factor": 0.88, "operating_hours": 20},
    # Overload
    {"motor_power": 7.5, "supply_voltage": 415, "running_current": 22.0, "temperature": 95, "vibration_level": 3.5, "power_factor": 0.82, "operating_hours": 18},
    {"motor_power": 11, "supply_voltage": 415, "running_current": 28.0, "temperature": 110, "vibration_level": 4.0, "power_factor": 0.78, "operating_hours": 22},
    # Shaft misalignment
    {"motor_power": 15, "supply_voltage": 415, "running_current": 35.0, "temperature": 80, "vibration_level": 9.5, "power_factor": 0.84, "operating_hours": 14},
    # Overheating
    {"motor_power": 5.5, "supply_voltage": 415, "running_current": 9.8, "temperature": 105, "vibration_level": 2.5, "power_factor": 0.86, "operating_hours": 20},
    # Voltage imbalance
    {"motor_power": 22, "supply_voltage": 390, "running_current": 45.0, "temperature": 72, "vibration_level": 3.2, "power_factor": 0.68, "operating_hours": 10},
    # Stator fault
    {"motor_power": 11, "supply_voltage": 415, "running_current": 18.0, "temperature": 98, "vibration_level": 3.8, "power_factor": 0.72, "operating_hours": 16},
    # More healthy
    {"motor_power": 37, "supply_voltage": 415, "running_current": 65.0, "temperature": 58, "vibration_level": 2.8, "power_factor": 0.91, "operating_hours": 8},
]


def seed_database():
    """Insert sample diagnostic data into the database."""
    diagnostic_engine = RuleBasedDiagnosticEngine()
    recommendation_engine = RecommendationEngine()
    db = SessionLocal()

    try:
        # Clear existing data
        db.query(DiagnosticRecord).delete()
        db.commit()

        base_time = datetime.now() - timedelta(days=len(SAMPLE_DATA))

        for i, params in enumerate(SAMPLE_DATA):
            # Run diagnosis
            result = diagnostic_engine.diagnose(**params)
            recommendations = recommendation_engine.get_recommendations(
                result.fault_detected, result.severity
            )

            record = DiagnosticRecord(
                timestamp=base_time + timedelta(days=i, hours=i * 2),
                motor_power=params["motor_power"],
                supply_voltage=params["supply_voltage"],
                running_current=params["running_current"],
                temperature=params["temperature"],
                vibration_level=params["vibration_level"],
                power_factor=params["power_factor"],
                operating_hours=params["operating_hours"],
                health_score=result.health_score,
                health_category=result.health_category,
                fault_detected=result.fault_detected,
                severity=result.severity,
                recommendations=json.dumps(recommendations),
            )
            db.add(record)

        db.commit()
        print(f"Successfully seeded {len(SAMPLE_DATA)} diagnostic records.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
