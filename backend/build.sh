#!/usr/bin/env bash
# Render build script

set -e

# Install Python dependencies
pip install -r requirements.txt

# Seed the database with sample data (only if DB doesn't exist)
if [ ! -f "motor_diagnostics.db" ]; then
    python seed_data.py
fi

echo "Build complete!"
