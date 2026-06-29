/**
 * Type definitions for the Motor Fault Diagnostic Tool.
 */

export interface DiagnosticInput {
  motor_power: number;
  supply_voltage: number;
  running_current: number;
  temperature: number;
  vibration_level: number;
  power_factor: number;
  operating_hours: number;
}

export interface DiagnosticResult {
  id: number;
  timestamp: string;
  motor_power: number;
  supply_voltage: number;
  running_current: number;
  temperature: number;
  vibration_level: number;
  power_factor: number;
  operating_hours: number;
  health_score: number;
  health_category: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  fault_detected: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendations: string[];
}

export interface Stats {
  total_diagnostics: number;
  average_health_score: number;
  fault_distribution: Record<string, number>;
  recent_trend: Array<{
    id: number;
    timestamp: string;
    health_score: number;
    fault_detected: string;
  }>;
}

export type Page = 'dashboard' | 'diagnose' | 'history';
