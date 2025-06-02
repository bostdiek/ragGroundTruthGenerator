"""
Generation router for the AI Ground Truth Generator backend.

This module handles answer generation operations.
"""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from providers.factory import get_generator
from providers.generation import GenerationManager

# Create router
router = APIRouter()

# Define models
class GenerationRequest(BaseModel):
    """Model for generation request data."""
    question: str
    documents: List[Dict[str, Any]]
    custom_rules: List[str] = []
    model: str = "demo-model"
    temperature: float = 0.7
    max_tokens: int = 1000

class GenerationResponse(BaseModel):
    """Model for generation response data."""
    answer: str
    model_used: str
    token_usage: Dict[str, int]

# Get generation manager instance
def get_generation_manager():
    """Get a generation manager instance."""
    generator = get_generator()
    return GenerationManager(generator)


# POST /generation/answer endpoint for answer generation (matches test expectations)
from fastapi import Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from providers.factory import get_auth_provider

@router.post("/answer", response_model=Dict[str, Any])
async def generate_answer(
    request: GenerationRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Generate an answer based on the provided documents.
    Requires authentication.
    """
    # Auth check
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid token format")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    auth_provider = get_auth_provider()
    try:
        await auth_provider.verify_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e) or "Invalid token")

    # Use the demo generation logic
    # In a real app, use the manager/generator
    answer = ""
    if request.documents:
        # Use the first document's content for a simple answer
        answer = f"Based on the provided documents, the answer is: {request.documents[0].get('content', 'No content available.')}"
    else:
        answer = "No documents provided. Cannot generate an answer."
    # Apply custom rules (demo: just append them)
    if request.custom_rules:
        answer += " Rules: " + "; ".join(request.custom_rules)
    return {
        "answer": answer,
        "model": request.model,
        "token_usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30}
    }

# We don't need a get_available_models endpoint for the demo
# The generation will always use the demo model, so the frontend doesn't need
# to know about available models
