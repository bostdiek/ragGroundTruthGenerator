"""
Base database provider interface for the AI Ground Truth Generator.

This module defines the interface that all database providers must implement.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Union


class BaseDatabase(ABC):
    """
    Base interface for all database providers.
    
    This abstract class defines the interface that all database providers
    must implement. A database provider is responsible for storing and
    retrieving data for the application.
    
    To implement a custom database provider:
    1. Create a new class that inherits from BaseDatabase
    2. Implement all the abstract methods
    3. Register the provider in the factory module
    """
    
    @abstractmethod
    async def get_collection(self, collection_id: str) -> Dict[str, Any]:
        """
        Get a collection by ID.
        
        Args:
            collection_id: The ID of the collection to retrieve
            
        Returns:
            Dict[str, Any]: The collection data
            
        Raises:
            Exception: If the collection does not exist
        """
        pass
        
    @abstractmethod
    async def list_collections(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        List all collections matching the specified filters.
        
        Args:
            filters: Optional filters to apply to the query
            
        Returns:
            List[Dict[str, Any]]: A list of collections
        """
        pass
        
    @abstractmethod
    async def create_collection(self, collection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new collection.
        
        Args:
            collection_data: The collection data
            
        Returns:
            Dict[str, Any]: The created collection
            
        Raises:
            Exception: If creation fails
        """
        pass
        
    @abstractmethod
    async def update_collection(self, collection_id: str, collection_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing collection.
        
        Args:
            collection_id: The ID of the collection to update
            collection_data: The new collection data
            
        Returns:
            Dict[str, Any]: The updated collection
            
        Raises:
            Exception: If the collection does not exist or update fails
        """
        pass
        
    @abstractmethod
    async def delete_collection(self, collection_id: str) -> Dict[str, Any]:
        """
        Delete a collection.
        
        Args:
            collection_id: The ID of the collection to delete
            
        Returns:
            Dict[str, Any]: The deleted collection
            
        Raises:
            Exception: If the collection does not exist or deletion fails
        """
        pass
        
    @abstractmethod
    async def get_qa_pair(self, collection_id: str, qa_pair_id: str) -> Dict[str, Any]:
        """
        Get a QA pair from a collection.
        
        Args:
            collection_id: The ID of the collection
            qa_pair_id: The ID of the QA pair
            
        Returns:
            Dict[str, Any]: The QA pair data
            
        Raises:
            Exception: If the collection or QA pair does not exist
        """
        pass
        
    @abstractmethod
    async def list_qa_pairs(self, collection_id: str, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        List all QA pairs in a collection.
        
        Args:
            collection_id: The ID of the collection
            filters: Optional filters to apply to the query
            
        Returns:
            List[Dict[str, Any]]: A list of QA pairs
            
        Raises:
            Exception: If the collection does not exist
        """
        pass
        
    @abstractmethod
    async def add_qa_pair(self, collection_id: str, qa_pair_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a QA pair to a collection.
        
        Args:
            collection_id: The ID of the collection
            qa_pair_data: The QA pair data
            
        Returns:
            Dict[str, Any]: The added QA pair
            
        Raises:
            Exception: If the collection does not exist or addition fails
        """
        pass
        
    @abstractmethod
    async def update_qa_pair(self, collection_id: str, qa_pair_id: str, qa_pair_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update a QA pair in a collection.
        
        Args:
            collection_id: The ID of the collection
            qa_pair_id: The ID of the QA pair
            qa_pair_data: The new QA pair data
            
        Returns:
            Dict[str, Any]: The updated QA pair
            
        Raises:
            Exception: If the collection or QA pair does not exist or update fails
        """
        pass
        
    @abstractmethod
    async def delete_qa_pair(self, collection_id: str, qa_pair_id: str) -> Dict[str, Any]:
        """
        Delete a QA pair from a collection.
        
        Args:
            collection_id: The ID of the collection
            qa_pair_id: The ID of the QA pair
            
        Returns:
            Dict[str, Any]: The deleted QA pair
            
        Raises:
            Exception: If the collection or QA pair does not exist or deletion fails
        """
        pass
