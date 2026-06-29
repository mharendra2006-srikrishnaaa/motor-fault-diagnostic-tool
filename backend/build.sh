#!/usr/bin/env bash
# Render build script

set -e

# Install Python dependencies
pip install -r requirements.txt

# Seed the database with sample data
python seed_data.py

echo "Build complete!"
