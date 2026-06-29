"""
Motor Fault Diagnostic Tool - FastAPI Backend
Main application entry point.
"""

import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database import engine, Base
from app.routes import diagnostics, reports, stats

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Motor Fault Diagnostic Tool",
    description="API for diagnosing induction motor faults based on operating parameters",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(diagnostics.router, prefix="/api", tags=["Diagnostics"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(stats.router, prefix="/api", tags=["Statistics"])

# Serve frontend static files in production
FRONTEND_DIR = Path(__file__).parent.parent / "static"

if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        """Serve the React SPA for any non-API route."""
        file_path = FRONTEND_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIR / "index.html")
else:
    @app.get("/")
    def root():
        return {"message": "Motor Fault Diagnostic Tool API", "version": "1.0.0"}
