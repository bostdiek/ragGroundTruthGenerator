"""
Generation router for the AI Ground Truth Generator backend.

This module handles answer generation operations.
"""

from typing import Any

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from providers.factory import get_auth_provider, get_generator
from providers.generation import GenerationManager

# Create router
router = APIRouter()


# Define models
class GenerationRequest(BaseModel):
    """Model for generation request data."""

    question: str
    documents: list[dict[str, Any]]
    custom_rules: list[str] = []
    model: str = "demo-model"
    temperature: float = 0.7
    max_tokens: int = 1000


class GenerationResponse(BaseModel):
    """Model for generation response data."""

    answer: str
    model_used: str
    token_usage: dict[str, int]


# Get generation manager instance
def get_generation_manager():
    """Get a generation manager instance."""
    generator = get_generator()
    return GenerationManager(generator)


# POST /generation/answer endpoint for answer generation (matches test expectations)
@router.post("/answer", response_model=dict[str, Any])
async def generate_answer(
    request: GenerationRequest, authorization: str | None = Header(None)
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
    except Exception as err:
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        ) from err
    auth_provider = get_auth_provider()
    try:
        await auth_provider.verify_token(token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e) or "Invalid token") from e

    # Use the generation manager with the factory-provided generator
    generation_manager = get_generation_manager()

    try:
        response = await generation_manager.generate_answer(
            question=request.question,
            documents=request.documents,
            custom_rules=request.custom_rules,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens,
        )

        return {
            "answer": response["answer"],
            "model_used": response["model_used"],
            "token_usage": response["token_usage"],
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating answer: {str(e)}"
        ) from e


# We don't need a get_available_models endpoint for the demo
# The generation will always use the demo model, so the frontend doesn't need
# to know about available models
