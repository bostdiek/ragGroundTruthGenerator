#!/bin/bash
# Run all tests for the backend

# Set the environment variables for testing
export DATABASE_PROVIDER=memory
export GENERATION_PROVIDER=demo
export RETRIEVAL_PROVIDER=template
export ENABLED_DATA_SOURCES=memory
export AUTH_SECRET_KEY=test_secret_key

# Use uv to run pytest with all options
uv run pytest tests/ -v

# Run with coverage (optional)
# uv run pytest --cov=providers tests/ -v
