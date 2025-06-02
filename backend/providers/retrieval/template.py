"""
Simple template retrieval provider for development.

This module provides a simple template-based retrieval provider for development.
In production, replace this with your actual retrieval implementation.
"""
from typing import Any, Dict, List, Optional

from providers.retrieval.base import BaseRetriever


class TemplateRetriever(BaseRetriever):
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
                    "difficulty": "hard"
                }
            }
        ]
        
        # Create some sample templates for demonstration
        self.templates = [
            {
                "id": "template1",
                "name": "Standard Q&A Template",
                "description": "A standard template for question-answer pairs",
                "fields": [
                    {
                        "name": "question",
                        "type": "text",
                        "required": True,
                        "label": "Question",
                        "placeholder": "Enter the question..."
                    },
                    {
                        "name": "answer",
                        "type": "textarea",
                        "required": True,
                        "label": "Answer",
                        "placeholder": "Enter the answer..."
                    },
                    {
                        "name": "documents",
                        "type": "document_list",
                        "required": False,
                        "label": "Reference Documents",
                        "placeholder": "Search for documents..."
                    },
                    {
                        "name": "status",
                        "type": "select",
                        "required": True,
                        "label": "Status",
                        "options": [
                            {"value": "draft", "label": "Draft"},
                            {"value": "review", "label": "In Review"},
                            {"value": "approved", "label": "Approved"},
                            {"value": "rejected", "label": "Rejected"}
                        ],
                        "default_value": "draft"
                    }
                ]
            },
            {
                "id": "template2",
                "name": "Technical Support Template",
                "description": "A template for technical support questions",
                "fields": [
                    {
                        "name": "question",
                        "type": "text",
                        "required": True,
                        "label": "Issue Description",
                        "placeholder": "Describe the technical issue..."
                    },
                    {
                        "name": "answer",
                        "type": "textarea",
                        "required": True,
                        "label": "Resolution Steps",
                        "placeholder": "Provide steps to resolve the issue..."
                    },
                    {
                        "name": "severity",
                        "type": "select",
                        "required": True,
                        "label": "Severity",
                        "options": [
                            {"value": "low", "label": "Low"},
                            {"value": "medium", "label": "Medium"},
                            {"value": "high", "label": "High"},
                            {"value": "critical", "label": "Critical"}
                        ],
                        "default_value": "medium"
                    },
                    {
                        "name": "documents",
                        "type": "document_list",
                        "required": False,
                        "label": "Reference Documents",
                        "placeholder": "Search for documents..."
                    }
                ]
            }
        ]
    
    async def get_template(self, template_id: str) -> Dict[str, Any]:
        """
        Get a template by ID.
        
        Args:
            template_id: The ID of the template to retrieve
            
        Returns:
            Dict[str, Any]: The template data
            
        Raises:
            Exception: If the template does not exist
        """
        for template in self.templates:
            if template["id"] == template_id:
                return template
                
        raise Exception(f"Template {template_id} not found")
        
    async def list_templates(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        List all templates matching the specified filters.
        
        Args:
            filters: Optional filters to apply to the query
            
        Returns:
            List[Dict[str, Any]]: A list of templates
        """
        if filters is None:
            filters = {}
            
        # Apply filters (simple implementation)
        filtered_templates = self.templates
        
        for key, value in filters.items():
            filtered_templates = [t for t in filtered_templates if t.get(key) == value]
        
        return filtered_templates


def get_retriever() -> TemplateRetriever:
    """
    Get a TemplateRetriever instance.
    
    Returns:
        TemplateRetriever: A template retriever instance
    """
    return TemplateRetriever()
