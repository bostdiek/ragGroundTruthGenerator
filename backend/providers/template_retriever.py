"""
Simple template retrieval provider for development.

This module provides a simple template-based retrieval provider for development.
In production, replace this with your actual retrieval implementation.
"""
from typing import Dict, List, Any, Optional

class TemplateRetriever:
    """
    A simple template-based retriever implementation for development.
    
    This class provides a basic implementation for retrieving documents based on templates.
    In production, replace this with your actual search service implementation.
    """
    
    def __init__(self):
        """Initialize the template retriever."""
        # Create some sample documents for demonstration
        self.sample_documents = [
            {
                "id": "doc1",
                "name": "Air Filter Maintenance Guide",
                "content": "This guide explains how to replace air filters in various equipment.",
                "url": "https://example.com/docs/air-filter-guide",
                "metadata": {
                    "type": "maintenance",
                    "equipment": "HVAC",
                    "difficulty": "easy"
                }
            },
            {
                "id": "doc2",
                "name": "Safety Procedures Handbook",
                "content": "Comprehensive safety procedures for maintenance tasks.",
                "url": "https://example.com/docs/safety-handbook",
                "metadata": {
                    "type": "safety",
                    "equipment": "general",
                    "difficulty": "medium"
                }
            },
            {
                "id": "doc3",
                "name": "Troubleshooting Common Issues",
                "content": "Guide to troubleshooting common equipment problems.",
                "url": "https://example.com/docs/troubleshooting",
                "metadata": {
                    "type": "troubleshooting",
                    "equipment": "general",
                    "difficulty": "advanced"
                }
            }
        ]
    
    async def search_documents(
        self, 
        query: str, 
        filters: Dict[str, Any] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for documents based on a query.
        
        Args:
            query: The search query.
            filters: Optional filters to apply to the search.
            limit: Maximum number of results to return.
            
        Returns:
            List[Dict[str, Any]]: The list of matching documents.
        """
        # Simple keyword-based filtering for development
        results = []
        
        for doc in self.sample_documents:
            # Simple keyword matching (case-insensitive)
            if (query.lower() in doc["name"].lower() or 
                query.lower() in doc["content"].lower()):
                
                # Apply filters if provided
                if filters:
                    include = True
                    for key, value in filters.items():
                        if key.startswith("metadata."):
                            # Handle metadata filters
                            meta_key = key.split(".", 1)[1]
                            if meta_key not in doc["metadata"] or doc["metadata"][meta_key] != value:
                                include = False
                                break
                        elif key in doc and doc[key] != value:
                            include = False
                            break
                            
                    if not include:
                        continue
                
                results.append(doc)
                
                # Limit results
                if len(results) >= limit:
                    break
        
        return results

def get_retriever() -> TemplateRetriever:
    """
    Get a template retriever instance.
    
    Returns:
        TemplateRetriever: A template retriever instance.
    """
    return TemplateRetriever()
