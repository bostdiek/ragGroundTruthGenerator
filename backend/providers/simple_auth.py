"""
Simple authentication provider for development.

This module provides a simple pass-through authentication mechanism for development.
In production, replace this with your actual authentication implementation.
"""

import os
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from fastapi import Header, HTTPException, status
from pydantic import BaseModel

# Simple in-memory user database for development
# In production, replace with your actual user database
DEMO_USERS = {
    "demo@example.com": {
        "id": "user_1",
        "name": "Demo User",
        "email": "demo@example.com",
        "password": "password",  # NEVER do this in production
        "roles": ["contributor"],
    },
    "admin@example.com": {
        "id": "user_2",
        "name": "Admin User",
        "email": "admin@example.com",
        "password": "admin123",  # NEVER do this in production
        "roles": ["contributor", "admin"],
    },
}

# Get secret key from environment variable
SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "development_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None
    roles: list[str] = []


class User(BaseModel):
    id: str
    name: str
    email: str
    roles: list[str]


def create_access_token(
    data: dict[str, Any], expires_delta: timedelta | None = None
) -> str:
    """
    Create a JWT access token for the user.

    Args:
        data: The data to encode in the token.
        expires_delta: Optional expiration time delta.

    Returns:
        str: The encoded JWT token.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> TokenData:
    """
    Verify a JWT token and extract the token data.

    Args:
        token: The JWT token to verify.

    Returns:
        TokenData: The decoded token data.

    Raises:
        HTTPException: If the token is invalid.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        roles: list[str] = payload.get("roles", [])

        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return TokenData(email=email, roles=roles)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(authorization: str = Header(None)) -> User:
    """
    Get the current user from the authorization header.

    Args:
        authorization: The authorization header containing the JWT token.

    Returns:
        User: The current user.

    Raises:
        HTTPException: If the token is invalid or the user is not found.
    """
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1]
    token_data = verify_token(token)

    if token_data.email not in DEMO_USERS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user_data = DEMO_USERS[token_data.email]
    return User(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"],
        roles=user_data["roles"],
    )


def authenticate_user(email: str, password: str) -> dict[str, Any] | None:
    """
    Authenticate a user by email and password.

    Args:
        email: The user's email.
        password: The user's password.

    Returns:
        Optional[Dict[str, Any]]: The user data if authentication is successful, None otherwise.
    """
    if email not in DEMO_USERS:
        return None

    user = DEMO_USERS[email]

    if user["password"] != password:
        return None

    return user
