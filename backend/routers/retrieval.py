"""
Retrieval router for the AI Ground Truth Generator backend.

This module handles document retrieval operations.
"""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from pydantic import BaseModel

from providers.factory import get_all_data_source_providers, get_data_source_provider, get_auth_provider

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

    model_config = {"from_attributes": True}

class RetrievalRequest(BaseModel):
    """Model for retrieval request data."""
    query: str
    sources: List[str] = []
    filters: Optional[Dict[str, Any]] = None
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
                source_results = await provider.retrieve_documents(request.query, request.filters)
                results.extend(source_results)
            except ValueError:
                # Skip invalid sources
                continue
    else:
        # Otherwise use all available sources
        providers = get_all_data_source_providers()
        for provider_id, provider in providers.items():
            source_results = await provider.retrieve_documents(request.query, request.filters)
            results.extend(source_results)
    
    # Sort by relevance if available, otherwise preserve order
    results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
    
    # Limit results if requested
    if request.max_results:
        results = results[:request.max_results]
    
    return results

@router.get("/search", response_model=List[Document])
async def search_documents_get(
    query: str = Query(..., description="The search query"),
    provider: str = Query("memory", description="The data source provider to use"),
    limit: int = Query(5, description="Maximum number of results to return"),
    authorization: Optional[str] = Header(None)
):
    """
    Search for documents based on a query using GET method.
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

    try:
        data_provider = get_data_source_provider(provider)
        results = await data_provider.retrieve_documents(query, limit=limit)
        return results
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid provider: {provider}"
        )

@router.get("/data_sources", response_model=List[Dict[str, str]])
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

from fastapi import Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from providers.factory import get_auth_provider

@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_templates(authorization: Optional[str] = Header(None)):
    """
    Get all available templates.
    
    Returns:
        List of templates with id, name, and description.
    """
    # This is a simple implementation that returns hardcoded templates
    # In a real application, you would retrieve these from a database or service
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

    templates = [
        {
            "id": "template1",
            "name": "General Question",
            "description": "A general question template for most inquiries",
            "prompt": "Based on the following documents, please answer the question: {question}",
            "fields": ["question"]
        },
        {
            "id": "template2",
            "name": "Technical Explanation",
            "description": "A template for technical explanations with detailed context",
            "prompt": "Using the technical documentation provided, explain in detail: {question}",
            "fields": ["question"]
        },
        {
            "id": "template3",
            "name": "Step-by-Step Guide",
            "description": "A template for procedural instructions",
            "prompt": "Based on the provided documentation, explain the step-by-step process to: {question}",
            "fields": ["question"]
        }
    ]
    return templates

@router.get("/templates/{template_id}", response_model=Dict[str, Any])
async def get_template(template_id: str, authorization: Optional[str] = Header(None)):
    """
    Get a specific template by ID.
    
    Args:
        template_id: The ID of the template to retrieve.
        
    Returns:
        The template with the specified ID.
        
    Raises:
        HTTPException: If the template is not found.
    """
    # This is a simple implementation that returns hardcoded templates
    # In a real application, you would retrieve these from a database or service
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

    templates = {
        "template1": {
            "id": "template1",
            "name": "General Question",
            "description": "A general question template for most inquiries",
            "prompt": "Based on the following documents, please answer the question: {question}",
            "fields": ["question"]
        },
        "template2": {
            "id": "template2",
            "name": "Technical Explanation",
            "description": "A template for technical explanations with detailed context",
            "prompt": "Using the technical documentation provided, explain in detail: {question}",
            "fields": ["question"]
        },
        "template3": {
            "id": "template3",
            "name": "Step-by-Step Guide",
            "description": "A template for procedural instructions",
            "prompt": "Based on the provided documentation, explain the step-by-step process to: {question}",
            "fields": ["question"]
        }
    }
    if template_id not in templates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found"
        )
    return templates[template_id]
