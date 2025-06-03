"""
Unit tests for the authentication provider.
"""

import pytest
from fastapi import HTTPException

from providers.auth.simple_auth import SimpleAuthProvider


class TestSimpleAuthProvider:
    """Tests for the SimpleAuthProvider implementation."""

    def setup_method(self):
        """Set up the test environment."""
        self.provider = SimpleAuthProvider()

    @pytest.mark.asyncio
    async def test_authenticate_valid_credentials(self):
        """Test authentication with valid credentials."""
        # The demo user is defined in simple_auth.py
        result = await self.provider.authenticate("demo@example.com", "password")

        assert "access_token" in result
        assert result["token_type"] == "bearer"
        assert "user" in result
        assert result["user"]["email"] == "demo@example.com"

    @pytest.mark.asyncio
    async def test_authenticate_invalid_credentials(self):
        """Test authentication with invalid credentials."""
        with pytest.raises(HTTPException) as excinfo:
            await self.provider.authenticate("demo@example.com", "wrong_password")

        assert excinfo.value.status_code == 401
        assert "Incorrect username or password" in str(excinfo.value.detail)

    @pytest.mark.asyncio
    async def test_authenticate_nonexistent_user(self):
        """Test authentication with a nonexistent user."""
        with pytest.raises(HTTPException) as excinfo:
            await self.provider.authenticate("nonexistent@example.com", "password")

        assert excinfo.value.status_code == 401
        assert "Incorrect username or password" in str(excinfo.value.detail)

    @pytest.mark.asyncio
    async def test_verify_token_valid(self):
        """Test token verification with a valid token."""
        # First get a valid token
        auth_result = await self.provider.authenticate("demo@example.com", "password")
        token = auth_result["access_token"]

        # Then verify it
        user = await self.provider.verify_token(token)

        assert user.email == "demo@example.com"
        assert "contributor" in user.roles

    @pytest.mark.asyncio
    async def test_verify_token_invalid(self):
        """Test token verification with an invalid token."""
        with pytest.raises(HTTPException) as excinfo:
            await self.provider.verify_token("invalid_token")

        assert excinfo.value.status_code == 401
        assert "Could not validate credentials" in str(excinfo.value.detail)
