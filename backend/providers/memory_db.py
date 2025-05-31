"""
Simple in-memory database provider for development.

This module provides a simple in-memory database implementation for development.
In production, replace this with your actual database implementation (MongoDB, CosmosDB, etc.).
"""
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

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
                    "content": "Section on troubleshooting",
                    "source": "Technical Documentation"
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
                    "content": "Section on service intervals",
                    "source": "Technical Documentation"
                }
            ],
            "status": "pending",
            "metadata": {"priority": "medium"},
            "created_at": "2023-06-05T09:45:00Z",
            "updated_at": "2023-06-06T14:20:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa3",
            "collection_id": "col2",
            "question": "How do I create a new SAP notification?",
            "answer": "Navigate to the Notifications module, click 'Create New', fill in the required fields, and submit the form.",
            "documents": [
                {
                    "id": "doc3",
                    "title": "SAP User Guide",
                    "content": "Chapter on notifications",
                    "source": "SAP Documentation"
                }
            ],
            "status": "draft",
            "metadata": {"priority": "low"},
            "created_at": "2023-06-10T11:30:00Z",
            "updated_at": "2023-06-10T11:30:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa4",
            "collection_id": "col3",
            "question": "Where can I find the company holiday schedule?",
            "answer": "The company holiday schedule is available on the HR page of the internal wiki, under 'Benefits and Time Off'.",
            "documents": [
                {
                    "id": "doc4",
                    "title": "HR Policies",
                    "content": "Section on time off",
                    "source": "Internal Wiki"
                }
            ],
            "status": "approved",
            "metadata": {"priority": "medium"},
            "created_at": "2023-05-20T13:15:00Z",
            "updated_at": "2023-05-21T09:10:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa5",
            "collection_id": "col1",
            "question": "How do I troubleshoot error code E-45?",
            "answer": "Error code E-45 indicates a power supply issue. Check the power connections and voltage levels.",
            "documents": [
                {
                    "id": "doc1",
                    "title": "Equipment Manual",
                    "content": "Section on error codes",
                    "source": "Technical Documentation"
                }
            ],
            "status": "rejected",
            "metadata": {"priority": "high"},
            "created_at": "2023-06-08T14:20:00Z",
            "updated_at": "2023-06-09T10:15:00Z",
            "created_by": "demo_user"
        },
        {
            "id": "qa6",
            "collection_id": "col1",
            "question": "What is the warranty period for replacement parts?",
            "answer": "All replacement parts come with a 90-day warranty from the date of installation.",
            "documents": [
                {
                    "id": "doc2",
                    "title": "Warranty Information",
                    "content": "Section on replacement parts",
                    "source": "Technical Documentation"
                }
            ],
            "status": "draft",
            "metadata": {"priority": "medium"},
            "created_at": "2023-06-12T09:30:00Z",
            "updated_at": "2023-06-12T09:30:00Z",
            "created_by": "demo_user"
        }
    ],
    "documents": [
        {
            "id": "doc1",
            "title": "Equipment Manual",
            "content": "Section on troubleshooting",
            "source": "Technical Documentation",
            "created_at": "2023-05-10T08:00:00Z",
            "updated_at": "2023-05-10T08:00:00Z"
        },
        {
            "id": "doc2",
            "title": "Maintenance Schedule",
            "content": "Section on service intervals",
            "source": "Technical Documentation",
            "created_at": "2023-05-12T10:30:00Z",
            "updated_at": "2023-05-12T10:30:00Z"
        },
        {
            "id": "doc3",
            "title": "SAP User Guide",
            "content": "Chapter on notifications",
            "source": "SAP Documentation",
            "created_at": "2023-04-05T14:45:00Z",
            "updated_at": "2023-04-05T14:45:00Z"
        },
        {
            "id": "doc4",
            "title": "HR Policies",
            "content": "Section on time off",
            "source": "Internal Wiki",
            "created_at": "2023-01-15T09:20:00Z",
            "updated_at": "2023-01-15T09:20:00Z"
        }
    ]
}

class MemoryDB:
    """
    A simple in-memory database implementation for development.
    
    This class provides basic CRUD operations for collections in the in-memory database.
    In production, replace this with your actual database implementation.
    """
    
    def __init__(self, collection_name: str):
        """
        Initialize the memory database with a collection name.
        
        Args:
            collection_name: The name of the collection to operate on.
        """
        self.collection_name = collection_name
        
        # Create the collection if it doesn't exist
        if collection_name not in _database:
            _database[collection_name] = []
    
    async def find_all(self, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Find all documents in the collection that match the query.
        
        Args:
            query: The query to filter documents by.
            
        Returns:
            List[Dict[str, Any]]: The list of matching documents.
        """
        if query is None:
            return _database[self.collection_name]
        
        # Simple filtering implementation
        results = []
        for item in _database[self.collection_name]:
            match = True
            for key, value in query.items():
                if key not in item or item[key] != value:
                    match = False
                    break
            if match:
                results.append(item)
        
        return results
    
    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Find a single document in the collection that matches the query.
        
        Args:
            query: The query to filter documents by.
            
        Returns:
            Optional[Dict[str, Any]]: The matching document, or None if no match is found.
        """
        results = await self.find_all(query)
        return results[0] if results else None
    
    async def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Insert a document into the collection.
        
        Args:
            document: The document to insert.
            
        Returns:
            Dict[str, Any]: The inserted document with generated id.
        """
        # Generate a simple ID if not provided
        if "_id" not in document:
            document["_id"] = f"{len(_database[self.collection_name]) + 1}"
        
        # Add created_at and updated_at timestamps
        document["created_at"] = datetime.utcnow().isoformat()
        document["updated_at"] = document["created_at"]
        
        _database[self.collection_name].append(document)
        return document
    
    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a document in the collection.
        
        Args:
            query: The query to find the document to update.
            update: The update to apply to the document.
            
        Returns:
            Optional[Dict[str, Any]]: The updated document, or None if no match is found.
        """
        document = await self.find_one(query)
        if document is None:
            return None
        
        # Apply the update
        document.update(update)
        
        # Update the updated_at timestamp
        document["updated_at"] = datetime.utcnow().isoformat()
        
        return document
    
    async def delete_one(self, query: Dict[str, Any]) -> bool:
        """
        Delete a document from the collection.
        
        Args:
            query: The query to find the document to delete.
            
        Returns:
            bool: True if a document was deleted, False otherwise.
        """
        document = await self.find_one(query)
        if document is None:
            return False
        
        _database[self.collection_name].remove(document)
        return True

def get_database(collection_name: str) -> MemoryDB:
    """
    Get a database instance for the specified collection.
    
    Args:
        collection_name: The name of the collection to operate on.
        
    Returns:
        MemoryDB: A database instance for the specified collection.
    """
    return MemoryDB(collection_name)
