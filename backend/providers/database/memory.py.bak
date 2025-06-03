"""
Simple in-memory database provider for development.

This module provides a simple in-memory database implementation for development.
In production, replace this with your actual database implementation (MongoDB, CosmosDB, etc.).
"""
import json
import os
from datetime import datetime, UTC
from typing import Any, Dict, List, Optional

from providers.database.base import BaseDatabase

# Simple in-memory database for development
# This will be reset when the application restarts
_database: Dict[str, List[Dict[str, Any]]] = {
    "collections": [
        {
            "id": "col1",
            "name": "Equipment Manuals",
            "description": "Technical manuals for equipment maintenance",
            "tags": ["manuals", "maintenance", "technical"],
            "document_count": 45,
            "created_at": "2023-05-15T10:30:00Z",
            "updated_at": "2023-06-20T15:45:00Z"
        },
        {
            "id": "col2",
            "name": "SAP Notifications",
            "description": "Historical customer issues and resolutions",
            "tags": ["sap", "notifications", "issues"],
            "document_count": 128,
            "created_at": "2023-04-10T09:15:00Z",
            "updated_at": "2023-06-22T11:20:00Z"
        },
        {
            "id": "col3",
            "name": "Internal Wiki",
            "description": "Knowledge base for common procedures",
            "tags": ["wiki", "knowledge", "procedures"],
            "document_count": 73,
            "created_at": "2023-01-05T14:20:00Z",
            "updated_at": "2023-06-15T08:30:00Z"
        }
    ],
    "qa_pairs": [
        {
            "id": "qa1",
            "collection_id": "col1",
            "question": "How do I reset the equipment?",
            "answer": "To reset the equipment, power cycle the device and wait for 30 seconds before turning it back on.",
            "documents": [
                {
                    "id": "doc1",
                    "title": "Equipment Manual",
                    "content": "Section on troubleshooting steps for common issues. Power cycle procedures are outlined on page 42.",
                    "source": {
                        "id": "tech_docs",
                        "name": "Technical Documentation",
                        "type": "manual"
                    },
                    "url": "https://example.com/docs/equipment-manual.pdf",
                    "metadata": {
                        "document_id": "EM-2023-042",
                        "last_updated": "2023-03-15",
                        "version": "2.4",
                        "department": "Engineering",
                        "page_number": 42
                    }
                }
            ],
            "status": "approved",
            "metadata": {"priority": "high"},
            "created_at": "2023-06-01T10:00:00Z",
            "updated_at": "2023-06-02T15:30:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa2",
            "collection_id": "col1",
            "question": "What are the maintenance intervals?",
            "answer": "Regular maintenance should be performed every 3 months, with a major service annually.",
            "documents": [
                {
                    "id": "doc2",
                    "title": "Maintenance Schedule",
                    "content": "Regular maintenance intervals are specified as quarterly (every 3 months) for basic service, with an annual comprehensive service that includes component replacement and calibration.",
                    "source": {
                        "id": "tech_docs",
                        "name": "Technical Documentation",
                        "type": "schedule"
                    },
                    "url": "https://example.com/docs/maintenance-schedule.pdf",
                    "metadata": {
                        "document_id": "MS-2023-015",
                        "last_updated": "2023-02-10",
                        "version": "1.2",
                        "department": "Maintenance",
                        "priority": "high"
                    }
                }
            ],
            "status": "approved",
            "metadata": {"priority": "medium"},
            "created_at": "2023-06-05T09:15:00Z",
            "updated_at": "2023-06-06T14:20:00Z",
            "created_by": "demo_user"
        }
    ]
}

class MemoryDatabase(BaseDatabase):
    """
    A simple in-memory database implementation.
    
    This class provides a basic implementation for storing and retrieving data
    from an in-memory dictionary. In production, replace this with your actual
    database implementation (MongoDB, CosmosDB, etc.).
    """
    
    def __init__(self, collection_name: str):
        """
        Initialize the memory database for a specific collection.
        
        Args:
            collection_name: The name of the collection to operate on
        """
        self.collection_name = collection_name
        
        # Ensure the collection exists in the database
        if collection_name not in _database:
            _database[collection_name] = []
    
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
        for collection in _database["collections"]:
            if collection["id"] == collection_id:
                return collection
                
        raise Exception(f"Collection {collection_id} not found")
        
    async def list_collections(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        List all collections matching the specified filters.
        
        Args:
            filters: Optional filters to apply to the query
            
        Returns:
            List[Dict[str, Any]]: A list of collections
        """
        if filters is None:
            filters = {}
            
        # Apply filters (simple implementation)
        filtered_collections = _database["collections"]
        
        for key, value in filters.items():
            filtered_collections = [c for c in filtered_collections if c.get(key) == value]
        
        return filtered_collections
        
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
        # Generate an ID if not provided
        if "id" not in collection_data:
            collection_data["id"] = f"col{len(_database['collections']) + 1}"
            
        # Add timestamps
        now = datetime.now(UTC).isoformat() + "Z"
        collection_data["created_at"] = now
        collection_data["updated_at"] = now
        
        # Set initial document count
        collection_data["document_count"] = 0
        
        # Add the collection to the database
        _database["collections"].append(collection_data)
        
        return collection_data
        
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
        for i, collection in enumerate(_database["collections"]):
            if collection["id"] == collection_id:
                # Update the collection
                updated_collection = {**collection, **collection_data}
                
                # Update timestamp
                updated_collection["updated_at"] = datetime.now(UTC).isoformat() + "Z"
                
                # Update the collection in the database
                _database["collections"][i] = updated_collection
                
                return updated_collection
                
        raise Exception(f"Collection {collection_id} not found")
        
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
        for i, collection in enumerate(_database["collections"]):
            if collection["id"] == collection_id:
                # Remove the collection from the database
                deleted_collection = _database["collections"].pop(i)
                
                # Remove associated QA pairs
                _database["qa_pairs"] = [qa for qa in _database["qa_pairs"] if qa["collection_id"] != collection_id]
                
                return deleted_collection
                
        raise Exception(f"Collection {collection_id} not found")
        
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
        # Check if collection exists
        await self.get_collection(collection_id)
        
        # Find the QA pair
        for qa_pair in _database["qa_pairs"]:
            if qa_pair["id"] == qa_pair_id and qa_pair["collection_id"] == collection_id:
                return qa_pair
                
        raise Exception(f"QA pair {qa_pair_id} not found in collection {collection_id}")
        
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
        # Check if collection exists
        await self.get_collection(collection_id)
        
        if filters is None:
            filters = {}
            
        # Apply collection_id filter
        filtered_qa_pairs = [qa for qa in _database["qa_pairs"] if qa["collection_id"] == collection_id]
        
        # Apply additional filters
        for key, value in filters.items():
            if key != "collection_id":  # collection_id already filtered above
                filtered_qa_pairs = [qa for qa in filtered_qa_pairs if qa.get(key) == value]
        
        return filtered_qa_pairs
        
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
        # Check if collection exists
        collection = await self.get_collection(collection_id)
        
        # Generate an ID if not provided
        if "id" not in qa_pair_data:
            qa_pair_data["id"] = f"qa{len(_database['qa_pairs']) + 1}"
            
        # Set the collection ID
        qa_pair_data["collection_id"] = collection_id
        
        # Add timestamps
        now = datetime.now(UTC).isoformat() + "Z"
        qa_pair_data["created_at"] = now
        qa_pair_data["updated_at"] = now
        
        # Add the QA pair to the database
        _database["qa_pairs"].append(qa_pair_data)
        
        # Update document count in the collection
        for i, coll in enumerate(_database["collections"]):
            if coll["id"] == collection_id:
                _database["collections"][i]["document_count"] = len(await self.list_qa_pairs(collection_id))
                _database["collections"][i]["updated_at"] = now
                break
        
        return qa_pair_data
        
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
        # Check if collection exists
        await self.get_collection(collection_id)
        
        for i, qa_pair in enumerate(_database["qa_pairs"]):
            if qa_pair["id"] == qa_pair_id and qa_pair["collection_id"] == collection_id:
                # Update the QA pair
                updated_qa_pair = {**qa_pair, **qa_pair_data}
                
                # Ensure collection_id doesn't change
                updated_qa_pair["collection_id"] = collection_id
                
                # Update timestamp
                updated_qa_pair["updated_at"] = datetime.now(UTC).isoformat() + "Z"
                
                # Update the QA pair in the database
                _database["qa_pairs"][i] = updated_qa_pair
                
                return updated_qa_pair
                
        raise Exception(f"QA pair {qa_pair_id} not found in collection {collection_id}")
        
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
        # Check if collection exists
        collection = await self.get_collection(collection_id)
        
        for i, qa_pair in enumerate(_database["qa_pairs"]):
            if qa_pair["id"] == qa_pair_id and qa_pair["collection_id"] == collection_id:
                # Remove the QA pair from the database
                deleted_qa_pair = _database["qa_pairs"].pop(i)
                
                # Update document count in the collection
                now = datetime.now(UTC).isoformat() + "Z"
                for i, coll in enumerate(_database["collections"]):
                    if coll["id"] == collection_id:
                        _database["collections"][i]["document_count"] = len(await self.list_qa_pairs(collection_id))
                        _database["collections"][i]["updated_at"] = now
                        break
                
                return deleted_qa_pair
                
        raise Exception(f"QA pair {qa_pair_id} not found in collection {collection_id}")


def get_database(collection_name: str) -> MemoryDatabase:
    """
    Get a MemoryDatabase instance for the specified collection.
    
    Args:
        collection_name: The name of the collection to operate on
        
    Returns:
        MemoryDatabase: A memory database instance for the specified collection
    """
    return MemoryDatabase(collection_name)
