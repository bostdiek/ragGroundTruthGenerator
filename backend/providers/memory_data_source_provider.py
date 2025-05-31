"""
Memory-based data source provider for the AI Ground Truth Generator.

This module provides a simple in-memory data source provider for development and demonstration.
"""
from typing import Any, Dict, List, Optional

from providers.base_data_source_provider import BaseDataSourceProvider

class MemoryDataSourceProvider(BaseDataSourceProvider):
    """
    A provider that searches through in-memory documents.
    
    This provider is intended for development and demonstration purposes.
    It holds a collection of sample documents in memory and performs
    simple text matching to simulate a search.
    """
    
    def __init__(self):
        """Initialize the memory provider with sample documents."""
        self.documents = [
            {
                "id": "doc1",
                "title": "Equipment Maintenance Manual",
                "content": "Regular maintenance of equipment is essential for optimal performance. " +
                          "This document outlines maintenance procedures for various equipment types.",
                "url": "https://example.com/docs/equipment-manual.pdf",
                "metadata": {
                    "type": "manual",
                    "topic": "maintenance",
                    "equipment_type": "general",
                    "created_date": "2023-01-15"
                }
            },
            {
                "id": "doc2",
                "title": "Troubleshooting Guide: Air Filters",
                "content": "Common issues with air filters include clogging, improper installation, " +
                          "and insufficient airflow. This guide provides step-by-step troubleshooting " +
                          "procedures for identifying and resolving air filter problems.",
                "url": "https://example.com/docs/airfilter-guide.pdf",
                "metadata": {
                    "type": "guide",
                    "topic": "troubleshooting",
                    "component": "air filter",
                    "created_date": "2023-03-22"
                }
            },
            {
                "id": "doc3",
                "title": "Safety Protocols for Equipment Operation",
                "content": "Safety is paramount when operating industrial equipment. This document " +
                          "covers essential safety protocols, including personal protective equipment, " +
                          "pre-operation checks, and emergency procedures.",
                "url": "https://example.com/docs/safety-protocols.pdf",
                "metadata": {
                    "type": "protocol",
                    "topic": "safety",
                    "importance": "critical",
                    "created_date": "2023-05-10"
                }
            },
            {
                "id": "doc4",
                "title": "Technical Specifications: Model X Series",
                "content": "Technical specifications for the Model X series include power requirements, " +
                          "dimensional constraints, operating conditions, and performance metrics. " +
                          "Reference this document when planning installations or upgrades.",
                "url": "https://example.com/docs/modelx-specs.pdf",
                "metadata": {
                    "type": "specifications",
                    "topic": "technical",
                    "model": "Model X",
                    "created_date": "2023-02-07"
                }
            }
        ]
    
    def get_name(self) -> str:
        """Return the name of this data source."""
        return "Sample Documents"
    
    def get_description(self) -> str:
        """Return a description of this data source."""
        return "Search through sample documents stored in memory for demonstration purposes"
    
    def get_id(self) -> str:
        """Return the unique identifier for this data source."""
        return "memory"
    
    async def retrieve_documents(self, query: str, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Retrieve documents matching the query.
        
        Performs a simple substring search in both title and content.
        
        Args:
            query: The search query
            filters: Optional filters to apply (not used in this implementation)
            
        Returns:
            A list of matching documents
        """
        query = query.lower()
        results = []
        
        for doc in self.documents:
            # Simple substring matching for demonstration purposes
            if (query in doc["title"].lower() or 
                query in doc["content"].lower()):
                
                # Create a copy of the document to avoid modifying the original
                result = doc.copy()
                
                # Add source attribution
                result["source"] = {
                    "id": self.get_id(),
                    "name": self.get_name(),
                    "type": "sample"
                }
                
                # Calculate a simple "relevance score" for demonstration
                title_match = query in doc["title"].lower()
                content_match = query in doc["content"].lower()
                
                # Assign higher score if match is in title
                result["relevance_score"] = 0.9 if title_match else 0.6
                
                results.append(result)
        
        # Sort by relevance score
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return results

def get_provider():
    """Get an instance of the memory data source provider."""
    return MemoryDataSourceProvider()
