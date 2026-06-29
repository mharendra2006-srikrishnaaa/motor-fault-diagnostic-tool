# Motor Fault Diagnostic Tool

A professional web-based Motor Fault Diagnostic Tool for Electrical and Electronics Engineering applications. This system helps maintenance engineers and students diagnose common induction motor faults based on operating parameters.

![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.10+-green)
![React](https://img.shields.io/badge/react-18-blue)
![FastAPI](https://img.shields.io/badge/fastapi-0.104-teal)

## Features

- **Rule-Based Diagnostic Engine** — Classifies motor faults using ISO/IEEE threshold standards
- **Motor Health Score** — Weighted composite score (0–100) with gauge visualization
- **7 Fault Categories** — Healthy, Bearing Wear, Overload, Shaft Misalignment, Overheating, Voltage Imbalance, Stator Fault
- **Maintenance Recommendations** — Context-specific, severity-aware suggestions
- **PDF Report Generation** — Professional downloadable diagnostic reports
- **Historical Analysis** — Searchable/filterable fault history with trend charts
- **Industrial Dashboard** — Professional UI with real-time charts and status cards
- **AI-Ready Architecture** — Modular design for future ML model integration

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Python 3.10+, FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite |
| Reports | ReportLab (PDF) |
| Build | Vite |

## Project Structure

```
Motor Fault Diagnostic Tool/
├── backend/
│   ├── app/
│   │   ├── engines/             # Diagnostic & recommendation engines
│   │   │   ├── diagnostic_engine.py
│   │   │   └── recommendation_engine.py
│   │   ├── routes/              # API endpoints
│   │   │   ├── diagnostics.py
│   │   │   ├── reports.py
│   │   │   └── stats.py
│   │   ├── database.py          # SQLite/SQLAlchemy config
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── models.py            # ORM models
│   │   ├── report_generator.py  # PDF generation
│   │   └── schemas.py           # Pydantic validation
│   ├── seed_data.py             # Sample data generator
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page-level components
│   │   ├── api.ts               # API client
│   │   ├── types.ts             # TypeScript interfaces
│   │   └── App.tsx              # Root component
│   ├── package.json
│   └── index.html
├── requirements.md              # Functional requirements
├── design.md                    # System design document
├── tasks.md                     # Development task tracker
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed sample data (optional)
python seed_data.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diagnose` | Run motor fault diagnosis |
| GET | `/api/history` | Get diagnostic history |
| GET | `/api/history/{id}` | Get specific record |
| DELETE | `/api/history/{id}` | Delete a record |
| GET | `/api/report/{id}` | Download PDF report |
| GET | `/api/stats` | Dashboard statistics |

## Diagnostic Engine

The rule-based engine classifies faults using these parameter thresholds:

| Parameter | Normal | Warning | Critical |
|-----------|--------|---------|----------|
| Temperature | < 75°C | 75–100°C | > 100°C |
| Vibration | < 4.5 mm/s | 4.5–7.1 mm/s | > 7.1 mm/s |
| Current (vs rated) | < 100% | 100–115% | > 115% |
| Power Factor | > 0.85 | 0.70–0.85 | < 0.70 |

## Screenshots

The application features:
- Industrial dashboard with health gauge and trend charts
- Parameter input form with real-time validation
- Searchable diagnostic history table
- Professional PDF reports

## Future Enhancements

- Machine Learning diagnostic engine (TensorFlow/scikit-learn)
- Real-time sensor data integration (MQTT/OPC-UA)
- Multi-motor fleet management
- Predictive maintenance scheduling
- Mobile companion app

## License

MIT License — see LICENSE file for details.
