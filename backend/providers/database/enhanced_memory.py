"""
Enhanced version of the memory_db.py with improved debugging and more robust implementations.

This module builds on the existing MemoryDB class but adds better logging and more
robust implementations for find_one and update_one methods.
"""
import logging
from copy import deepcopy
from datetime import datetime, UTC
from typing import Any, Dict, List, Optional, Union

# Import the existing database dictionary to maintain data
from providers.memory_db import _database

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedMemoryDB:
    """
    An enhanced version of the in-memory database with better debugging and more robust implementations.
    
    This class provides improved versions of the database operations and adds better logging.
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
            logger.info(f"Created new collection: {collection_name}")
        else:
            logger.info(f"Using existing collection: {collection_name} with {len(_database[collection_name])} items")
    
    # Add aliases for method names to match test expectations
    async def list_collections(self, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Alias for find_all() to maintain compatibility."""
        logger.info(f"Listing collections with query: {query}")
        return await self.find_all(query)
        
    async def get_collection(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Alias for find_one() to maintain compatibility."""
        logger.info(f"Getting collection with query: {query}")
        return await self.find_one(query)
        
    async def create_collection(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Alias for insert_one() to maintain compatibility."""
        logger.info(f"Creating collection: {document.get('name')}")
        return await self.insert_one(document)
    
    async def find_all(self, query: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Find all documents in the collection that match the query.
        
        Args:
            query: The query to filter documents by.
            
        Returns:
            List[Dict[str, Any]]: The list of matching documents.
        """
        logger.info(f"Finding all in collection '{self.collection_name}' with query: {query}")
        
        if query is None:
            logger.info(f"No query provided, returning all {len(_database[self.collection_name])} items")
            return deepcopy(_database[self.collection_name])
        
        # Simple filtering implementation
        results = []
        for item in _database[self.collection_name]:
            match = True
            for key, value in query.items():
                if key not in item:
                    logger.debug(f"Key '{key}' not found in item {item.get('id', 'unknown')}")
                    match = False
                    break
                if item[key] != value:
                    logger.debug(f"Value mismatch for key '{key}': expected '{value}', got '{item[key]}'")
                    match = False
                    break
            if match:
                results.append(deepcopy(item))
        
        logger.info(f"Found {len(results)} matching items")
        return results
    
    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Find a single document in the collection that matches the query.
        
        Args:
            query: The query to filter documents by.
            
        Returns:
            Optional[Dict[str, Any]]: The matching document, or None if no match is found.
        """
        logger.info(f"Finding one in collection '{self.collection_name}' with query: {query}")
        
        # Enhanced find_one with better debugging
        if not query:
            logger.warning("Empty query provided to find_one, returning None")
            return None
        
        # Direct ID lookup optimization
        if len(query) == 1 and "id" in query:
            item_id = query["id"]
            logger.info(f"Optimized ID lookup for: {item_id}")
            
            for item in _database[self.collection_name]:
                if item.get("id") == item_id:
                    logger.info(f"Found item with ID: {item_id}")
                    return deepcopy(item)
            
            logger.info(f"No item found with ID: {item_id}")
            return None
        
        # Regular query processing
        results = await self.find_all(query)
        if results:
            logger.info(f"Found matching item: {results[0].get('id', 'unknown')}")
            return results[0]
        else:
            logger.info("No matching item found")
            return None
    
    async def insert_one(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """
        Insert a document into the collection.
        
        Args:
            document: The document to insert.
            
        Returns:
            Dict[str, Any]: The inserted document with generated id.
        """
        logger.info(f"Inserting document into '{self.collection_name}': {document.get('name', document.get('id', 'unknown'))}")
        
        # Make a deep copy to avoid modifying the original
        document_copy = deepcopy(document)
        
        # Generate a simple ID if not provided
        if "id" not in document_copy and "_id" not in document_copy:
            document_copy["id"] = f"{self.collection_name}_{len(_database[self.collection_name]) + 1}"
            logger.info(f"Generated new ID: {document_copy['id']}")
        
        # Add created_at and updated_at timestamps
        current_time = datetime.now(UTC).isoformat()
        document_copy["created_at"] = current_time
        document_copy["updated_at"] = current_time
        
        _database[self.collection_name].append(document_copy)
        logger.info(f"Document inserted successfully with ID: {document_copy.get('id', document_copy.get('_id', 'unknown'))}")
        
        return document_copy
    
    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update a document in the collection.
        
        Args:
            query: The query to find the document to update.
            update: The update to apply to the document.
            
        Returns:
            Optional[Dict[str, Any]]: The updated document, or None if no match is found.
        """
        logger.info(f"Updating document in '{self.collection_name}' with query: {query}")
        
        # Find the document
        document = None
        document_index = None
        
        # Direct access for better performance and to avoid reference issues
        for i, item in enumerate(_database[self.collection_name]):
            match = True
            for key, value in query.items():
                if key not in item or item[key] != value:
                    match = False
                    break
            if match:
                document = item
                document_index = i
                break
        
        if document is None:
            logger.warning(f"No document found to update with query: {query}")
            return None
        
        logger.info(f"Found document to update: {document.get('id', 'unknown')}")
        
        # Apply the update
        for key, value in update.items():
            if key != "id" and key != "_id":  # Don't allow changing IDs
                _database[self.collection_name][document_index][key] = value
        
        # Update the updated_at timestamp
        _database[self.collection_name][document_index]["updated_at"] = datetime.now(UTC).isoformat()
        
        logger.info(f"Document updated successfully: {document.get('id', 'unknown')}")
        
        # Return a copy to avoid reference issues
        return deepcopy(_database[self.collection_name][document_index])
    
    async def delete_one(self, query: Dict[str, Any]) -> bool:
        """
        Delete a document from the collection.
        
        Args:
            query: The query to find the document to delete.
            
        Returns:
            bool: True if a document was deleted, False otherwise.
        """
        logger.info(f"Deleting document from '{self.collection_name}' with query: {query}")
        
        # Enhanced delete implementation for more reliability
        for i, item in enumerate(_database[self.collection_name]):
            match = True
            for key, value in query.items():
                if key not in item or item[key] != value:
                    match = False
                    break
            if match:
                _database[self.collection_name].pop(i)
                logger.info(f"Document deleted successfully: {item.get('id', 'unknown')}")
                return True
        
        logger.warning(f"No document found to delete with query: {query}")
        return False

def get_enhanced_database(collection_name: str) -> EnhancedMemoryDB:
    """
    Get an enhanced database instance for the specified collection.
    
    Args:
        collection_name: The name of the collection to operate on.
        
    Returns:
        EnhancedMemoryDB: An enhanced database instance for the specified collection.
    """
    return EnhancedMemoryDB(collection_name)
