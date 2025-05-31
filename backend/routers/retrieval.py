"""
Retrieval router for the AI Ground Truth Generator backend.

This module handles document retrieval operations.
"""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from providers.factory import get_all_data_source_providers, get_data_source_provider

# Create router
router = APIRouter()

# Define models
class DocumentBase(BaseModel):
    """Base model for document data."""
    title: str
    content: str
    source: Dict[str, Any]
    url: Optional[str] = None
    metadata: Dict[str, Any] = {}

class Document(DocumentBase):
    """Model for document response data."""
    id: str
    relevance_score: Optional[float] = None

    class Config:
        """Pydantic configuration."""
        from_attributes = True

class RetrievalRequest(BaseModel):
    """Model for retrieval request data."""
    query: str
    sources: List[str] = []
    max_results: int = 10

# Define retrieval endpoints
@router.post("/search", response_model=List[Document])
async def search_documents(request: RetrievalRequest):
    """
    Search for documents based on a query.
    
    Args:
        request: The retrieval request containing the query and filters.
        
    Returns:
        List[Document]: A list of retrieved documents.
    """
    results = []
    
    # If specific sources are requested, only use those
    if request.sources:
        for source_id in request.sources:
            try:
                provider = get_data_source_provider(source_id)
                source_results = await provider.retrieve_documents(request.query)
                results.extend(source_results)
            except ValueError:
                # Skip invalid sources
                continue
    else:
        # Otherwise use all available sources
        providers = get_all_data_source_providers()
        for provider_id, provider in providers.items():
            source_results = await provider.retrieve_documents(request.query)
            results.extend(source_results)
    
    # Sort by relevance if available, otherwise preserve order
    results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
    
    # Limit results if requested
    if request.max_results:
        results = results[:request.max_results]
    
    return results

@router.get("/sources", response_model=List[Dict[str, str]])
async def get_sources():
    """
    Get all available data sources.
    
    Returns:
        List of data sources with id, name, and description.
    """
    providers = get_all_data_source_providers()
    sources = []
    
    for provider_id, provider in providers.items():
        sources.append({
            "id": provider.get_id(),
            "name": provider.get_name(),
            "description": provider.get_description()
        })
    
    return sources
