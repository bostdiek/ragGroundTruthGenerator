"""
Base data source provider interface for the AI Ground Truth Generator.

This module defines the interface that all data source providers must implement.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseDataSourceProvider(ABC):
    """
    Base interface for all data source providers.
    
    This abstract class defines the interface that all data source providers
    must implement. A data source provider is responsible for retrieving
    documents from a specific source based on a search query.
    
    To implement a custom data source provider:
    1. Create a new class that inherits from BaseDataSourceProvider
    2. Implement all the abstract methods
    3. Register the provider in the factory module
    """
    
    @abstractmethod
    def get_name(self) -> str:
        """
        Return the user-friendly name of this data source.
        
        This name will be displayed in the UI when selecting data sources.
        
        Returns:
            str: The name of the data source
        """
        pass
        
    @abstractmethod
    def get_description(self) -> str:
        """
        Return a description of this data source.
        
        This description will be displayed in the UI to help users understand
        what kind of documents this source provides.
        
        Returns:
            str: A brief description of the data source
        """
        pass
    
    @abstractmethod
    def get_id(self) -> str:
        """
        Return a unique identifier for this data source.
        
        This ID is used to reference the data source in API calls and configurations.
        It should be a simple string without spaces or special characters.
        
        Returns:
            str: The unique identifier
        """
        pass
    
    @abstractmethod
    async def retrieve_documents(self, query: str, filters: Optional[Dict[str, Any]] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve documents from this data source based on the query.
        
        This method should search the data source for documents matching the query
        and return them in a standardized format. Each document should include
        source attribution to identify which data source it came from.
        
        Args:
            query: The search query string
            filters: Optional filters to apply to the search
            limit: Maximum number of results to return
            
        Returns:
            List[Dict[str, Any]]: A list of documents matching the query.
            Each document should have at minimum the following fields:
            - id: A unique identifier for the document
            - title: The document title
            - content: The document content
            - source: A dictionary with 'id', 'name', and optionally 'type' keys
        """
        pass
