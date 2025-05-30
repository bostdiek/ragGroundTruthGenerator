#!/bin/bash
# This script runs the AI Ground Truth Generator backend using uv

# Activate the virtual environment (not needed with uv run)
# source .venv/bin/activate

# Run the FastAPI application
uv run python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
