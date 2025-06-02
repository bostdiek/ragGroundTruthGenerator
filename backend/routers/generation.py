"""
Generation router for the AI Ground Truth Generator backend.

This module handles answer generation operations.
"""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from providers.factory import get_generator
from providers.generation_manager import GenerationManager

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

# Define generation endpoints
@router.post("/generate", response_model=GenerationResponse)
async def generate_answer(
    request: GenerationRequest,
    manager: GenerationManager = Depends(get_generation_manager)
):
    """
    Generate an answer based on the provided documents.
    
    Args:
        request: The generation request containing the question, documents, and generation parameters.
        manager: The generation manager to use.
        
    Returns:
        GenerationResponse: The generated answer and metadata.
    """
    try:
        # Generate answer using manager
        response = await manager.generate_answer(
            question=request.question,
            documents=request.documents,
            custom_rules=request.custom_rules,
            model=request.model,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        return response
    except Exception as e:
        # Log the error
        print(f"Error generating answer: {str(e)}")
        # Return a user-friendly error
        raise HTTPException(
            status_code=500,
            detail="An error occurred while generating the answer."
        )

# We don't need a get_available_models endpoint for the demo
# The generation will always use the demo model, so the frontend doesn't need
# to know about available models
