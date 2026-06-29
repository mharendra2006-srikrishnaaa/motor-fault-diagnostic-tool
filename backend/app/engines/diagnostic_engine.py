"""
Diagnostic Engine Module
Implements rule-based fault detection for induction motors.

Architecture Note:
    This module uses a base class (BaseDiagnosticEngine) to allow
    future ML-based engines to replace the rule-based logic without
    changing the API layer.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class DiagnosticResult:
    """Internal result from the diagnostic engine."""

    health_score: int
    health_category: str
    fault_detected: str
    severity: str


class BaseDiagnosticEngine(ABC):
    """Abstract base class for diagnostic engines (rule-based or ML)."""

    @abstractmethod
    def diagnose(
        self,
        motor_power: float,
        supply_voltage: float,
        running_current: float,
        temperature: float,
        vibration_level: float,
        power_factor: float,
        operating_hours: float,
    ) -> DiagnosticResult:
        pass


class RuleBasedDiagnosticEngine(BaseDiagnosticEngine):
    """
    Rule-based diagnostic engine using ISO/IEEE threshold standards.

    Thresholds are based on:
    - ISO 10816 for vibration severity
    - IEEE 43 for temperature limits
    - Industry standards for current and power factor
    """

    # Temperature thresholds (°C)
    TEMP_NORMAL = 75
    TEMP_WARNING = 100
    TEMP_CRITICAL = 130

    # Vibration thresholds (mm/s) - ISO 10816 Class II
    VIB_NORMAL = 4.5
    VIB_WARNING = 7.1
    VIB_CRITICAL = 11.0

    # Current overload thresholds (percentage of rated)
    CURRENT_NORMAL = 1.0  # 100% of rated
    CURRENT_WARNING = 1.15  # 115%
    CURRENT_CRITICAL = 1.30  # 130%

    # Power factor thresholds
    PF_NORMAL = 0.85
    PF_WARNING = 0.70
    PF_CRITICAL = 0.50

    def _estimate_rated_current(self, motor_power: float, supply_voltage: float, power_factor: float) -> float:
        """Estimate rated current from motor parameters (3-phase motor)."""
        # P = √3 × V × I × PF × η (assume η ≈ 0.9)
        efficiency = 0.9
        rated_current = (motor_power * 1000) / (1.732 * supply_voltage * power_factor * efficiency)
        return rated_current

    def _calculate_health_score(
        self,
        temp_score: float,
        vib_score: float,
        current_score: float,
        pf_score: float,
    ) -> int:
        """
        Calculate weighted health score (0-100).

        Weights:
        - Temperature: 30%
        - Vibration: 25%
        - Current: 25%
        - Power Factor: 20%
        """
        score = (temp_score * 0.30 + vib_score * 0.25 + current_score * 0.25 + pf_score * 0.20)
        return max(0, min(100, int(score)))

    def _score_temperature(self, temperature: float) -> float:
        """Map temperature to a 0-100 sub-score."""
        if temperature <= self.TEMP_NORMAL:
            return 100
        elif temperature <= self.TEMP_WARNING:
            return 100 - ((temperature - self.TEMP_NORMAL) / (self.TEMP_WARNING - self.TEMP_NORMAL)) * 50
        elif temperature <= self.TEMP_CRITICAL:
            return 50 - ((temperature - self.TEMP_WARNING) / (self.TEMP_CRITICAL - self.TEMP_WARNING)) * 40
        else:
            return max(0, 10 - (temperature - self.TEMP_CRITICAL))

    def _score_vibration(self, vibration: float) -> float:
        """Map vibration to a 0-100 sub-score."""
        if vibration <= self.VIB_NORMAL:
            return 100
        elif vibration <= self.VIB_WARNING:
            return 100 - ((vibration - self.VIB_NORMAL) / (self.VIB_WARNING - self.VIB_NORMAL)) * 50
        elif vibration <= self.VIB_CRITICAL:
            return 50 - ((vibration - self.VIB_WARNING) / (self.VIB_CRITICAL - self.VIB_WARNING)) * 40
        else:
            return max(0, 10 - (vibration - self.VIB_CRITICAL) * 2)

    def _score_current(self, current_ratio: float) -> float:
        """Map current ratio (actual/rated) to a 0-100 sub-score."""
        if current_ratio <= self.CURRENT_NORMAL:
            return 100
        elif current_ratio <= self.CURRENT_WARNING:
            return 100 - ((current_ratio - self.CURRENT_NORMAL) / (self.CURRENT_WARNING - self.CURRENT_NORMAL)) * 50
        elif current_ratio <= self.CURRENT_CRITICAL:
            return 50 - ((current_ratio - self.CURRENT_WARNING) / (self.CURRENT_CRITICAL - self.CURRENT_WARNING)) * 40
        else:
            return max(0, 10 - (current_ratio - self.CURRENT_CRITICAL) * 50)

    def _score_power_factor(self, pf: float) -> float:
        """Map power factor to a 0-100 sub-score."""
        if pf >= self.PF_NORMAL:
            return 100
        elif pf >= self.PF_WARNING:
            return 100 - ((self.PF_NORMAL - pf) / (self.PF_NORMAL - self.PF_WARNING)) * 50
        elif pf >= self.PF_CRITICAL:
            return 50 - ((self.PF_WARNING - pf) / (self.PF_WARNING - self.PF_CRITICAL)) * 40
        else:
            return max(0, 10 - (self.PF_CRITICAL - pf) * 100)

    def _classify_fault(
        self,
        temperature: float,
        vibration: float,
        current_ratio: float,
        power_factor: float,
    ) -> tuple[str, str]:
        """
        Classify the motor fault condition based on parameter combinations.

        Returns:
            Tuple of (fault_name, severity)
        """
        high_temp = temperature > self.TEMP_NORMAL
        high_vib = vibration > self.VIB_NORMAL
        high_current = current_ratio > self.CURRENT_NORMAL
        low_pf = power_factor < self.PF_NORMAL

        critical_temp = temperature > self.TEMP_WARNING
        critical_vib = vibration > self.VIB_WARNING
        critical_current = current_ratio > self.CURRENT_WARNING

        # Rule priority: most specific combinations first
        if high_temp and high_current and critical_temp:
            return "Overload Condition", "Critical" if critical_current else "High"

        if high_vib and high_current:
            severity = "Critical" if (critical_vib and critical_current) else "High"
            return "Shaft Misalignment", severity

        if high_vib and not high_current:
            severity = "Critical" if critical_vib else "Medium" if vibration > self.VIB_NORMAL else "Low"
            return "Bearing Wear", severity

        if high_temp and low_pf:
            severity = "High" if critical_temp else "Medium"
            return "Possible Stator Fault", severity

        if high_temp and not high_current:
            severity = "High" if critical_temp else "Medium"
            return "Overheating", severity

        if low_pf and high_current:
            return "Voltage Imbalance", "Medium"

        if high_current:
            return "Overload Condition", "Medium"

        if high_temp:
            return "Overheating", "Low"

        if high_vib:
            return "Bearing Wear", "Low"

        if low_pf:
            return "Voltage Imbalance", "Low"

        return "Healthy Operation", "Low"

    def _get_health_category(self, score: int) -> str:
        """Map health score to category."""
        if score >= 90:
            return "Excellent"
        elif score >= 75:
            return "Good"
        elif score >= 50:
            return "Warning"
        else:
            return "Critical"

    def diagnose(
        self,
        motor_power: float,
        supply_voltage: float,
        running_current: float,
        temperature: float,
        vibration_level: float,
        power_factor: float,
        operating_hours: float,
    ) -> DiagnosticResult:
        """
        Run fault diagnosis on the provided motor parameters.

        Args:
            motor_power: Rated power in kW
            supply_voltage: Supply voltage in V
            running_current: Measured current in A
            temperature: Motor temperature in °C
            vibration_level: Vibration in mm/s
            power_factor: Power factor (0-1)
            operating_hours: Daily operating hours

        Returns:
            DiagnosticResult with score, category, fault, and severity
        """
        # Estimate rated current and compute ratio
        rated_current = self._estimate_rated_current(motor_power, supply_voltage, power_factor)
        current_ratio = running_current / rated_current if rated_current > 0 else 1.0

        # Calculate individual scores
        temp_score = self._score_temperature(temperature)
        vib_score = self._score_vibration(vibration_level)
        current_score = self._score_current(current_ratio)
        pf_score = self._score_power_factor(power_factor)

        # Apply operating hours penalty (>16 hrs adds fatigue factor)
        hours_penalty = max(0, (operating_hours - 16) * 2) if operating_hours > 16 else 0

        # Overall health score
        health_score = self._calculate_health_score(temp_score, vib_score, current_score, pf_score)
        health_score = max(0, health_score - int(hours_penalty))

        # Classify fault
        fault_detected, severity = self._classify_fault(
            temperature, vibration_level, current_ratio, power_factor
        )

        # Determine health category
        health_category = self._get_health_category(health_score)

        return DiagnosticResult(
            health_score=health_score,
            health_category=health_category,
            fault_detected=fault_detected,
            severity=severity,
        )
