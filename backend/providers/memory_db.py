"""
Simple in-memory database provider for development.

This module provides a simple in-memory database implementation for development.
In production, replace this with your actual database implementation (MongoDB, CosmosDB, etc.).
"""
from typing import Dict, List, Any, Optional
import json
import os
from datetime import datetime

# Simple in-memory database for development
# This will be reset when the application restarts
_database: Dict[str, List[Dict[str, Any]]] = {
    "collections": [],
    "qa_pairs": [],
    "documents": []
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
