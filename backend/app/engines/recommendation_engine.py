"""
Recommendation Engine Module
Provides maintenance recommendations based on detected faults.

Architecture Note:
    This module is designed to be replaceable with ML-based
    recommendation systems in the future.
"""


class RecommendationEngine:
    """Generates maintenance recommendations based on fault classification."""

    # Mapping of faults to actionable recommendations
    RECOMMENDATIONS = {
        "Healthy Operation": [
            "Continue regular maintenance schedule",
            "Monitor parameters during next inspection cycle",
            "Document current baseline readings for trend analysis",
        ],
        "Bearing Wear": [
            "Inspect bearing lubrication condition immediately",
            "Check bearing alignment and seating",
            "Measure bearing clearance with dial indicator",
            "Schedule bearing replacement if vibration exceeds 7.1 mm/s",
            "Inspect shaft journal for wear marks",
            "Check for contamination in lubricant",
        ],
        "Overload Condition": [
            "Reduce mechanical load on the motor immediately",
            "Inspect connected equipment for binding or jamming",
            "Verify motor sizing matches application requirements",
            "Check for voltage drop at motor terminals",
            "Inspect drive belts and couplings for excessive friction",
            "Consider upgrading to a higher-rated motor if persistent",
        ],
        "Shaft Misalignment": [
            "Perform laser alignment check on motor-load coupling",
            "Inspect flexible coupling for wear or damage",
            "Check motor mounting bolts and foundation",
            "Verify thermal growth calculations",
            "Inspect shaft for runout using dial indicator",
            "Re-align motor and driven equipment",
        ],
        "Overheating": [
            "Improve motor cooling and ventilation immediately",
            "Clean cooling fins and fan blades",
            "Check ambient temperature conditions",
            "Inspect winding insulation resistance (megger test)",
            "Verify adequate airflow around motor frame",
            "Check for blocked ventilation openings",
        ],
        "Voltage Imbalance": [
            "Check supply voltage at all three phases",
            "Inspect power cable connections for looseness",
            "Verify transformer tap settings",
            "Check for single-phasing condition",
            "Measure voltage imbalance percentage (should be < 2%)",
            "Inspect contactors and breakers for pitting",
        ],
        "Possible Stator Fault": [
            "Perform insulation resistance test (megger test) immediately",
            "Check stator winding resistance balance between phases",
            "Inspect for signs of overheating or discoloration",
            "Perform surge comparison test if available",
            "Check for moisture ingress in terminal box",
            "Schedule motor rewinding if insulation resistance < 1 MΩ",
        ],
    }

    def get_recommendations(self, fault_detected: str, severity: str) -> list[str]:
        """
        Get maintenance recommendations for a detected fault.

        Args:
            fault_detected: The classified fault condition
            severity: Severity level (Low, Medium, High, Critical)

        Returns:
            List of actionable maintenance recommendations
        """
        recommendations = self.RECOMMENDATIONS.get(fault_detected, [])

        # Add severity-specific urgency notes
        if severity == "Critical":
            recommendations = [
                "⚠️ CRITICAL: Immediate action required - risk of motor failure",
                "Consider shutting down motor until inspection is complete",
            ] + recommendations
        elif severity == "High":
            recommendations = [
                "⚠️ HIGH PRIORITY: Schedule maintenance within 24-48 hours",
            ] + recommendations

        return recommendations
