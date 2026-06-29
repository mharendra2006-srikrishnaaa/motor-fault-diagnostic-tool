# Motor Fault Diagnostic Tool - Design Document

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │Dashboard │ │Input Form│ │ History  │ │  Reports  │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API (HTTP/JSON)
┌─────────────────────────┴───────────────────────────────┐
│                   Backend (FastAPI)                       │
│  ┌──────────────┐ ┌───────────────┐ ┌────────────────┐  │
│  │  API Layer   │ │  Diagnostic   │ │ Recommendation │  │
│  │  (Routes)    │ │   Engine      │ │    Engine      │  │
│  └──────────────┘ └───────────────┘ └────────────────┘  │
│  ┌──────────────┐ ┌───────────────┐                     │
│  │  Data Layer  │ │   Reporting   │                     │
│  │  (SQLite)    │ │   Module      │                     │
│  └──────────────┘ └───────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## Backend Design

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diagnose` | Run diagnostic analysis |
| GET | `/api/history` | Get diagnostic history |
| GET | `/api/history/{id}` | Get specific diagnosis |
| DELETE | `/api/history/{id}` | Delete a diagnosis |
| GET | `/api/report/{id}` | Download PDF report |
| GET | `/api/stats` | Get summary statistics |

### Data Models

#### DiagnosticInput
```python
class DiagnosticInput:
    motor_power: float      # kW
    supply_voltage: float   # V
    running_current: float  # A
    temperature: float      # °C
    vibration_level: float  # mm/s
    power_factor: float     # 0-1
    operating_hours: float  # hrs/day
```

#### DiagnosticResult
```python
class DiagnosticResult:
    id: int
    timestamp: datetime
    input_params: DiagnosticInput
    health_score: int           # 0-100
    health_category: str        # Excellent/Good/Warning/Critical
    fault_detected: str         # Fault classification
    recommendations: list[str]  # Maintenance suggestions
    severity: str               # Low/Medium/High/Critical
```

### Diagnostic Engine Design

The diagnostic engine is designed as a pluggable interface:

```python
class BaseDiagnosticEngine(ABC):
    @abstractmethod
    def diagnose(self, input: DiagnosticInput) -> DiagnosticResult:
        pass

class RuleBasedEngine(BaseDiagnosticEngine):
    """Current implementation using threshold rules"""
    pass

class MLEngine(BaseDiagnosticEngine):
    """Future: ML-based diagnosis"""
    pass
```

### Threshold Configuration

| Parameter | Normal | Warning | Critical |
|-----------|--------|---------|----------|
| Temperature | < 75°C | 75-100°C | > 100°C |
| Vibration | < 4.5 mm/s | 4.5-7.1 mm/s | > 7.1 mm/s |
| Current (% rated) | < 100% | 100-115% | > 115% |
| Power Factor | > 0.85 | 0.7-0.85 | < 0.7 |

### Health Score Calculation

The health score is a weighted composite:

- Temperature factor: 30%
- Vibration factor: 25%
- Current factor: 25%
- Power Factor: 20%

Each factor maps the parameter to a 0-100 sub-score based on threshold ranges.

## Frontend Design

### Component Architecture

```
App
├── Layout
│   ├── Sidebar
│   └── Header
├── Pages
│   ├── Dashboard
│   │   ├── HealthGauge
│   │   ├── StatusCards
│   │   ├── FaultAnalysisPanel
│   │   └── RecommendationPanel
│   ├── DiagnosticForm
│   │   ├── ParameterInputs
│   │   └── ResultDisplay
│   └── History
│       ├── HistoryTable
│       └── HistoryChart
└── Shared
    ├── GaugeChart
    ├── StatusBadge
    └── LoadingSpinner
```

### Color Scheme (Industrial Theme)

- Primary: `#1e40af` (Blue-800)
- Secondary: `#0f172a` (Slate-900)
- Success: `#059669` (Emerald-600)
- Warning: `#d97706` (Amber-600)
- Danger: `#dc2626` (Red-600)
- Background: `#f8fafc` (Slate-50)

### State Management

- React Context for global state (diagnostic results, history)
- Local state for form inputs
- API calls via fetch with async/await

## Database Schema

```sql
CREATE TABLE diagnostics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    motor_power REAL NOT NULL,
    supply_voltage REAL NOT NULL,
    running_current REAL NOT NULL,
    temperature REAL NOT NULL,
    vibration_level REAL NOT NULL,
    power_factor REAL NOT NULL,
    operating_hours REAL NOT NULL,
    health_score INTEGER NOT NULL,
    health_category TEXT NOT NULL,
    fault_detected TEXT NOT NULL,
    severity TEXT NOT NULL,
    recommendations TEXT NOT NULL
);
```

## Security Considerations

- Input validation on both frontend and backend
- CORS configuration for development/production
- SQL injection prevention via parameterized queries (SQLAlchemy ORM)

## Deployment

- Backend: Uvicorn ASGI server
- Frontend: Vite dev server / static build
- Database: SQLite file (no external DB required)
