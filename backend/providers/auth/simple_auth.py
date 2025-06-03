"""
Simple authentication provider for development.

This module provides a simple pass-through authentication mechanism for development.
In production, replace this with your actual authentication implementation.
"""
import os
import time
from datetime import datetime, timedelta, UTC
from typing import Any, Dict, List, Optional

import jwt
from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel

from providers.auth.base import BaseAuthProvider

# Simple in-memory user database for development
# In production, replace with your actual user database
DEMO_USERS = {
    "demo@example.com": {
        "id": "user_1",
        "name": "Demo User",
        "email": "demo@example.com",
        "password": "password",  # NEVER do this in production
        "roles": ["contributor"]
    },
    "demo": {  # Allow login with just "demo" as username
        "id": "user_1",
        "name": "Demo User",
        "email": "demo@example.com",
        "password": "password",  # NEVER do this in production
        "roles": ["contributor"]
    },
    "admin@example.com": {
        "id": "user_2",
        "name": "Admin User",
        "email": "admin@example.com",
        "password": "admin123",  # NEVER do this in production
        "roles": ["contributor", "admin"]
    },
    "admin": {  # Allow login with just "admin" as username
        "id": "user_2",
        "name": "Admin User",
        "email": "admin@example.com",
        "password": "admin123",  # NEVER do this in production
        "roles": ["contributor", "admin"]
    }
}

# Get secret key from environment variable
SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "development_secret_key_change_in_production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    roles: List[str] = []

class User(BaseModel):
    id: str
    name: str
    email: str
    roles: List[str]

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
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
        roles: List[str] = payload.get("roles", [])
        
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

class SimpleAuthProvider(BaseAuthProvider):
    """
    Simple authentication provider for development.
    
    This class provides a basic implementation for authentication using JWT tokens.
    In production, replace this with your actual authentication provider implementation.
    """
    
    async def authenticate(self, username: str, password: str) -> Dict[str, Any]:
        """
        Authenticate a user and generate an access token.
        
        Args:
            username: The username or email
            password: The password
            
        Returns:
            Dict[str, Any]: Authentication response with token and user info
            
        Raises:
            HTTPException: If authentication fails
        """
        # For development, allow authentication with either username or email
        user = None
        
        # Try to find the user by username or email
        if username in DEMO_USERS:
            user = DEMO_USERS[username]
            
            # Print debug info for authentication attempt
            print(f"Authentication attempt for user: {username}")
            print(f"Password check: {password == user['password']}")
        else:
            print(f"Authentication attempt failed: User '{username}' not found")
        
        # Check if user exists and password is correct
        if user is None or user["password"] != password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": user["email"],
                "roles": user["roles"]
            },
            expires_delta=access_token_expires
        )
        
        # Return token and user info
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "roles": user["roles"]
            }
        }
    
    async def register(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new user.
        
        Args:
            user_data: User registration data
            
        Returns:
            Dict[str, Any]: The registered user information
            
        Raises:
            HTTPException: If registration fails
        """
        # Check if email already exists
        if user_data["email"] in DEMO_USERS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        # Create new user
        # This is just a placeholder - in a real app, you'd store the user in your database
        new_user = {
            "id": f"user_{len(DEMO_USERS) + 1}",
            "name": user_data.get("name", user_data["email"].split("@")[0]),
            "email": user_data["email"],
            "password": user_data["password"],  # NEVER store plaintext passwords in production
            "roles": ["contributor"]  # Default role
        }
        
        # Add user to in-memory database
        # In a real app, you'd store the user in your actual database
        DEMO_USERS[user_data["email"]] = new_user
        
        # Return user info (excluding password)
        return {
            "id": new_user["id"],
            "name": new_user["name"],
            "email": new_user["email"],
            "roles": new_user["roles"]
        }
    
    async def validate_token(self, token: str) -> Dict[str, Any]:
        """
        Validate an access token.
        
        Args:
            token: The access token to validate
            
        Returns:
            Dict[str, Any]: The user information associated with the token
            
        Raises:
            HTTPException: If the token is invalid
        """
        token_data = verify_token(token)
        
        # Get user from email
        user = DEMO_USERS.get(token_data.email)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Return user info
        return {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "roles": user["roles"]
        }
        
    async def verify_token(self, token: str) -> TokenData:
        """
        Verify an access token and return token data.
        
        Args:
            token: The access token to verify
            
        Returns:
            TokenData: The token data (email and roles)
            
        Raises:
            HTTPException: If the token is invalid
        """
        try:
            # Decode the token
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            roles = payload.get("roles", [])
            
            if email is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Get user from email to verify the user exists
            user = DEMO_USERS.get(email)
            
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Return token data
            return TokenData(email=email, roles=roles)
            
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

def get_provider() -> SimpleAuthProvider:
    """
    Get a SimpleAuthProvider instance.
    
    Returns:
        SimpleAuthProvider: A simple authentication provider instance
    """
    return SimpleAuthProvider()

# Legacy function for backward compatibility
def get_current_user(authorization: Optional[str] = Header(None)) -> User:
    """
    Get the current user from the Authorization header.
    
    Args:
        authorization: The Authorization header value
        
    Returns:
        User: The current user
        
    Raises:
        HTTPException: If the authorization header is missing or invalid
    """
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract token from Authorization header
    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify token
    token_data = verify_token(token)
    
    # Get user from email
    user = DEMO_USERS.get(token_data.email)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Return user
    return User(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        roles=user["roles"]
    )
