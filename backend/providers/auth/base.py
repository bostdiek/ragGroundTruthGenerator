"""
Base authentication provider interface for the AI Ground Truth Generator.

This module defines the interface that all authentication providers must implement.
"""

from abc import ABC, abstractmethod
from typing import Any


class BaseAuthProvider(ABC):
    """
    Base interface for all authentication providers.

    This abstract class defines the interface that all authentication providers
    must implement. An authentication provider is responsible for authenticating
    users and generating access tokens.

    To implement a custom authentication provider:
    1. Create a new class that inherits from BaseAuthProvider
    2. Implement all the abstract methods
    3. Register the provider in the factory module
    """

    @abstractmethod
    async def authenticate(self, username: str, password: str) -> dict[str, Any]:
        """
        Authenticate a user and generate an access token.

        Args:
            username: The username
            password: The password

        Returns:
            Dict[str, Any]: A dictionary containing at least:
                - access_token: The JWT or other token
                - token_type: The token type (usually "bearer")
                - user: User information

        Raises:
            Exception: If authentication fails
        """
        pass

    @abstractmethod
    async def register(self, user_data: dict[str, Any]) -> dict[str, Any]:
        """
        Register a new user.

        Args:
            user_data: User registration data

        Returns:
            Dict[str, Any]: The registered user information

        Raises:
            Exception: If registration fails
        """
        pass

    @abstractmethod
    async def validate_token(self, token: str) -> dict[str, Any]:
        """
        Validate an access token.

        Args:
            token: The access token to validate

        Returns:
            Dict[str, Any]: The user information associated with the token

        Raises:
            Exception: If the token is invalid
        """
        pass
