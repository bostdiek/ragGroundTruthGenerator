"""
Authentication router for the AI Ground Truth Generator backend.

This module handles user authentication operations.
"""
import os
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from providers.auth.simple_auth import DEMO_USERS
from providers.factory import get_auth_provider

# Create router
router = APIRouter()

# Define models
class UserLogin(BaseModel):
    """Model for user login data."""
    username: str
    password: str

class UserRegister(BaseModel):
    """Model for user registration data."""
    username: str
    password: str
    email: str
    full_name: Optional[str] = None

class User(BaseModel):
    """Model for user response data."""
    id: str
    username: str
    email: str
    full_name: Optional[str] = None

class Token(BaseModel):
    """Model for authentication token data."""
    access_token: str
    token_type: str
    user: User

# Define authentication endpoints
@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    Authenticate a user.
    
    Args:
        user_data: The user login data.
        
    Returns:
        Token: Authentication token.
    """
    # Get the authentication provider
    auth_provider = get_auth_provider()
    
    # Authenticate the user
    try:
        result = await auth_provider.authenticate(user_data.username, user_data.password)
        
        # Format the response
        return {
            "access_token": result["access_token"],
            "token_type": result["token_type"],
            "user": {
                "id": result["user"]["id"],
                "username": result["user"]["name"],
                "email": result["user"]["email"],
                "full_name": result["user"].get("full_name", result["user"]["name"])
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e) or "Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/register", response_model=User)
async def register(user_data: UserRegister):
    """
    Register a new user.
    
    Args:
        user_data: The user registration data.
        
    Returns:
        User: The registered user.
    """
    # Get the authentication provider
    auth_provider = get_auth_provider()
    
    # Register the user
    try:
        user = await auth_provider.register({
            "email": user_data.email,
            "name": user_data.full_name or user_data.username,
            "password": user_data.password
        })
        
        # Format the response
        return {
            "id": user["id"],
            "username": user["name"],
            "email": user["email"],
            "full_name": user.get("full_name", user["name"])
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e) or "Registration failed",
        )

@router.get("/me", response_model=User)
async def get_current_user(authorization: Optional[str] = None):
    """
    Get the current authenticated user.
    
    Args:
        authorization: The Authorization header.
        
    Returns:
        User: The current authenticated user.
    """
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract token from Authorization header
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid token format")
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get the authentication provider
    auth_provider = get_auth_provider()
    
    # Validate the token
    try:
        token_data = await auth_provider.verify_token(token)
        
        # Get user information
        email = token_data.email
        user = DEMO_USERS.get(email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Format the response
        return {
            "id": user["id"],
            "username": user["name"],
            "email": user["email"],
            "full_name": user.get("full_name", user["name"])
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e) or "Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/providers", response_model=Dict[str, Any])
async def get_auth_providers():
    """
    Get available authentication providers.
    
    Returns:
        Dict[str, Any]: A dictionary of available authentication providers.
    """
    auth_provider = os.getenv("AUTH_PROVIDER", "simple")
    
    providers = {
        "current": auth_provider,
        "available": ["simple"]  # This could be dynamically generated in a real app
    }
    
    return providers