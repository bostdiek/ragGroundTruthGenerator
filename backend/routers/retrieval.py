"""
Retrieval router for the AI Ground Truth Generator backend.

This module handles document retrieval operations.
"""

from typing import Any

from fastapi import APIRouter, Header, HTTPException, Query, status
from pydantic import BaseModel

from providers.factory import (
    get_all_data_source_providers,
    get_auth_provider,
    get_data_source_provider,
)

# Create router
router = APIRouter()


# Define models
class DocumentBase(BaseModel):
    """Base model for document data."""

    title: str
    content: str
    source: dict[str, Any]
    url: str | None = None
    metadata: dict[str, Any] = {}


class Document(DocumentBase):
    """Model for document response data."""

    id: str
    relevance_score: float | None = None

    model_config = {"from_attributes": True}


class SearchResult(BaseModel):
    """Model for search results with pagination."""

    documents: list[Document]
    totalCount: int
    page: int
    totalPages: int


class RetrievalRequest(BaseModel):
    """Model for retrieval request data."""

    query: str
    sources: list[str] = []
    max_results: int = 10


# Define retrieval endpoints
@router.post("/search", response_model=SearchResult)
async def search_documents(request: RetrievalRequest):
    """
    Search for documents based on a query.

    Args:
        request: The retrieval request containing the query and sources.

    Returns:
        SearchResult: Search results with pagination metadata.
    """
    results = []

    # If specific sources are requested, only use those
    if request.sources:
        for source_id in request.sources:
            try:
                provider = get_data_source_provider(source_id)
                source_results = await provider.retrieve_documents(
                    request.query, {}, limit=request.max_results
                )
                results.extend(source_results)
            except ValueError:
                # Skip invalid sources
                continue
    else:
        # Use all available data sources
        providers = get_all_data_source_providers()
        for provider_id, provider in providers.items():
            try:
                source_results = await provider.retrieve_documents(
                    request.query, {}, limit=request.max_results
                )
                results.extend(source_results)
            except ValueError:
                # Skip invalid sources
                continue

    # Convert results to Document objects
    documents = []
    for result in results:
        documents.append(
            Document(
                id=result.get("id", ""),
                title=result.get("title", ""),
                content=result.get("content", ""),
                source=result.get("source", {}),
                url=result.get("url"),
                metadata=result.get("metadata", {}),
                relevance_score=result.get("relevance_score"),
            )
        )

    # Limit results
    documents = documents[: request.max_results]

    # Calculate pagination (simplified - just return page 1 for now)
    total_count = len(documents)
    
    return SearchResult(
        documents=documents,
        totalCount=total_count,
        page=1,
        totalPages=1 if total_count > 0 else 0,
    )


@router.get("/search", response_model=list[Document])
async def search_documents_get(
    query: str = Query(..., description="The search query"),
    provider: str = Query("memory", description="The data source provider to use"),
    limit: int = Query(5, description="Maximum number of results to return"),
    authorization: str | None = Header(None),
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
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )
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
            detail=f"Invalid provider: {provider}",
        )


class PaginatedResponse(BaseModel):
    """Model for paginated responses."""
    
    data: list[dict[str, str]]
    pagination: dict[str, int]

    model_config = {"from_attributes": True}


@router.get("/data_sources", response_model=PaginatedResponse)
async def get_sources(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(20, ge=1, le=100, description="Number of sources per page")
):
    """
    Get all available data sources with pagination.

    Returns:
        Paginated list of data sources with id, name, and description.
    """
    providers = get_all_data_source_providers()
    sources = []

    for provider_id, provider in providers.items():
        sources.append(
            {
                "id": provider.get_id(),
                "name": provider.get_name(),
                "description": provider.get_description(),
            }
        )

    # Apply pagination
    total_count = len(sources)
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_sources = sources[start_index:end_index]
    
    total_pages = (total_count + limit - 1) // limit  # Ceiling division

    return PaginatedResponse(
        data=paginated_sources,
        pagination={
            "page": page,
            "limit": limit,
            "totalCount": total_count,
            "totalPages": total_pages,
        }
    )


from fastapi import Header


@router.get("/templates", response_model=list[dict[str, Any]])
async def get_templates(authorization: str | None = Header(None)):
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
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )
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
            "fields": ["question"],
        },
        {
            "id": "template2",
            "name": "Technical Explanation",
            "description": "A template for technical explanations with detailed context",
            "prompt": "Using the technical documentation provided, explain in detail: {question}",
            "fields": ["question"],
        },
        {
            "id": "template3",
            "name": "Step-by-Step Guide",
            "description": "A template for procedural instructions",
            "prompt": "Based on the provided documentation, explain the step-by-step process to: {question}",
            "fields": ["question"],
        },
    ]
    return templates


@router.get("/templates/{template_id}", response_model=dict[str, Any])
async def get_template(template_id: str, authorization: str | None = Header(None)):
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
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )
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
            "fields": ["question"],
        },
        "template2": {
            "id": "template2",
            "name": "Technical Explanation",
            "description": "A template for technical explanations with detailed context",
            "prompt": "Using the technical documentation provided, explain in detail: {question}",
            "fields": ["question"],
        },
        "template3": {
            "id": "template3",
            "name": "Step-by-Step Guide",
            "description": "A template for procedural instructions",
            "prompt": "Based on the provided documentation, explain the step-by-step process to: {question}",
            "fields": ["question"],
        },
    }
    if template_id not in templates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found",
        )
    return templates[template_id]
