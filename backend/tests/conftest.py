"""
Test configuration and fixtures for the AI Ground Truth Generator.
"""

import os
import sys

import pytest
from fastapi.testclient import TestClient

# Add the parent directory to sys.path to allow importing from providers
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app


@pytest.fixture
def client():
    """
    Create a test client for the FastAPI application.

    Returns:
        TestClient: A FastAPI TestClient instance
    """
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """
    Create authentication headers for testing protected routes.

    This fixture uses the simple auth provider to generate a valid token
    for testing purposes.

    Returns:
        Dict: Headers with a valid authentication token
    """
    from providers.auth.simple_auth import DEMO_USERS, create_access_token

    # Use the demo user for testing
    user = DEMO_USERS["demo@example.com"]
    token = create_access_token({"sub": user["email"], "roles": user["roles"]})

    return {"Authorization": f"Bearer {token}"}
