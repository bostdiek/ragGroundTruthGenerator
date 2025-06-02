"""
Base retriever provider interface for the AI Ground Truth Generator.

This module defines the interface that all retriever providers must implement.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseRetriever(ABC):
    """
    Base interface for all retriever providers.
    
    This abstract class defines the interface that all retriever providers
    must implement. A retriever provider is responsible for retrieving
    templates or other structured data for the application.
    
    To implement a custom retriever provider:
    1. Create a new class that inherits from BaseRetriever
    2. Implement all the abstract methods
    3. Register the provider in the factory module
    """
    
    @abstractmethod
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
        pass
        
    @abstractmethod
    async def list_templates(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        List all templates matching the specified filters.
        
        Args:
            filters: Optional filters to apply to the query
            
        Returns:
            List[Dict[str, Any]]: A list of templates
        """
        pass
