# Motor Fault Diagnostic Tool - Requirements

## Project Overview

A professional web-based Motor Fault Diagnostic Tool for Electrical and Electronics Engineering applications. The system helps maintenance engineers and students diagnose common induction motor faults based on operating parameters.

## Functional Requirements

### FR-1: Input Parameters

The system shall accept the following motor operating parameters:

| Parameter | Unit | Valid Range |
|-----------|------|-------------|
| Motor Rated Power | kW | 0.1 - 1000 |
| Supply Voltage | V | 100 - 11000 |
| Running Current | A | 0.1 - 2000 |
| Motor Temperature | °C | 20 - 200 |
| Vibration Level | mm/s | 0 - 50 |
| Power Factor | - | 0.1 - 1.0 |
| Operating Hours per Day | hrs | 1 - 24 |

### FR-2: Diagnostic Engine

The system shall classify motor health into one of the following categories:

- Healthy Operation
- Bearing Wear
- Overload Condition
- Shaft Misalignment
- Overheating
- Voltage Imbalance
- Possible Stator Fault

Rule-based detection logic:

| Condition | Indicators |
|-----------|-----------|
| Overload Condition | High temperature + high current |
| Bearing Wear | High vibration + normal current |
| Shaft Misalignment | High vibration + high current |
| Possible Stator Fault | High temperature + voltage variation |
| Overheating | High temperature + low power factor |
| Voltage Imbalance | Abnormal power factor + high current |
| Healthy Operation | All values within normal limits |

### FR-3: Health Score

- Generate a Motor Health Score from 0–100
- Categories:
  - 90–100: Excellent
  - 75–89: Good
  - 50–74: Warning
  - Below 50: Critical
- Display using a professional gauge chart

### FR-4: Recommendations Engine

Provide context-specific maintenance recommendations based on detected faults.

### FR-5: Dashboard

- Professional industrial layout
- Responsive design
- Motor Health Gauge
- Status Cards
- Fault Analysis Panel
- Maintenance Recommendation Section
- Historical Diagnostic Table
- Interactive Charts

### FR-6: Report Generation

Generate downloadable PDF reports containing:
- Motor Details
- Input Parameters
- Health Score
- Detected Fault
- Recommendations
- Date and Time

### FR-7: Fault History

- Store diagnostic results in SQLite database
- Display in searchable, sortable table
- Allow filtering by date, fault type, health score

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Response Time | < 2 seconds |
| Mobile Responsive | Yes |
| UI Quality | Professional, recruiter-friendly |
| Code Quality | Well-documented, clean structure |
| Architecture | Modular, AI-ready |

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Python, FastAPI
- **Database**: SQLite
- **Reports**: PDF generation (ReportLab)

## Architecture Principles

- Modular design for future ML model integration
- Separation of concerns:
  - Data Collection Layer
  - Diagnostic Engine
  - Recommendation Engine
  - Reporting Module
