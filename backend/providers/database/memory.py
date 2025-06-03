"""
Simple in-memory database provider for development.

This module provides a simple in-memory database implementation for development.
In production, replace this with your actual database implementation (MongoDB, CosmosDB, etc.).
"""
import json
import os
import logging
from copy import deepcopy
from datetime import datetime, UTC
from typing import Any, Dict, List, Optional, Union

from providers.database.base import BaseDatabase

# Import the existing database dictionary or create a new one
try:
    from providers.memory_db import _database
except ImportError:
    # Simple in-memory database for development
    # This will be reset when the application restarts
    _database: Dict[str, List[Dict[str, Any]]] = {
        "collections": [
            {
                "id": "col1",
                "name": "Equipment Manuals",
                "description": "Technical manuals for various equipment",
                "type": "pdf",
                "created_at": "2023-01-15T12:00:00+00:00",
                "updated_at": "2023-01-15T12:00:00+00:00",
                "qa_pair_count": 25
            },
            {
                "id": "col2",
                "name": "Company Policies",
                "description": "Internal company policies and procedures",
                "type": "text",
                "created_at": "2023-02-20T10:30:00+00:00",
                "updated_at": "2023-02-20T10:30:00+00:00",
                "qa_pair_count": 15
            },
            {
                "id": "col3",
                "name": "Product Specifications",
                "description": "Detailed specifications for product lineup",
                "type": "excel",
                "created_at": "2023-03-10T15:45:00+00:00",
                "updated_at": "2023-03-10T15:45:00+00:00",
                "qa_pair_count": 30
            }
        ],
        "qa_pairs": [
            # QA pairs for Equipment Manuals (col1)
            {
                "id": "qa1",
                "collection_id": "col1",
                "question": "What is the maximum operating temperature for the Model X2000?",
                "answer": "The maximum operating temperature for the Model X2000 is 95°C (203°F).",
                "context": "The Model X2000 has been tested to operate in temperatures ranging from -10°C to 95°C...",
                "confidence": 0.92,
                "created_at": "2023-01-16T09:20:00+00:00",
                "updated_at": "2023-01-16T09:20:00+00:00",
                "metadata": {
                    "page": 24,
                    "source": "X2000_manual.pdf",
                    "reviewed": True
                }
            },
            # More QA pairs...
        ]
    }

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MemoryDatabase(BaseDatabase):
    """
    A simple in-memory database implementation with enhanced debugging and robust implementations.
    
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
        
    async def get_collection(self, query: Union[str, Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Alias for find_one() to maintain compatibility.
        
        Args:
            query: Either a collection ID (str) or a query dictionary
            
        Returns:
            Dict[str, Any]: The matching collection
            
        Raises:
            ValueError: If the collection is not found
        """
        logger.info(f"Getting collection with query: {query}")
        
        # Handle string ID for direct lookup
        if isinstance(query, str):
            result = await self.find_one({"id": query})
        else:
            # Handle dictionary query
            result = await self.find_one(query)
            
        if result is None:
            collection_id = query if isinstance(query, str) else query.get("id", "unknown")
            logger.error(f"Collection not found: {collection_id}")
            raise ValueError(f"Collection not found: {collection_id}")
            
        return result
        
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

    # QA pair related methods
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
        logger.info(f"Getting QA pair {qa_pair_id} from collection {collection_id}")
        
        # Verify the collection exists
        collection = await self.find_one({"id": collection_id})
        if not collection:
            logger.error(f"Collection {collection_id} not found")
            raise ValueError(f"Collection {collection_id} not found")
            
        # Get the QA pair
        qa_pairs_db = get_memory_database("qa_pairs")
        qa_pair = await qa_pairs_db.find_one({
            "id": qa_pair_id,
            "collection_id": collection_id
        })
        
        if not qa_pair:
            logger.error(f"QA pair {qa_pair_id} not found in collection {collection_id}")
            raise ValueError(f"QA pair {qa_pair_id} not found in collection {collection_id}")
            
        logger.info(f"Found QA pair {qa_pair_id}")
        return qa_pair
        
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
        logger.info(f"Listing QA pairs for collection {collection_id}")
        
        # Verify the collection exists
        collections_db = get_memory_database("collections")
        collection = await collections_db.find_one({"id": collection_id})
        if not collection:
            logger.error(f"Collection {collection_id} not found")
            raise ValueError(f"Collection {collection_id} not found")
            
        # Get all QA pairs for the collection
        qa_pairs_db = get_memory_database("qa_pairs")
        
        # Combine the collection_id filter with any additional filters
        if filters is None:
            filters = {}
            
        filters["collection_id"] = collection_id
        
        qa_pairs = await qa_pairs_db.find_all(filters)
        logger.info(f"Found {len(qa_pairs)} QA pairs for collection {collection_id}")
        
        return qa_pairs
        
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
        logger.info(f"Adding QA pair to collection {collection_id}")
        
        # Verify the collection exists
        collection = await self.find_one({"id": collection_id})
        if not collection:
            logger.error(f"Collection {collection_id} not found")
            raise ValueError(f"Collection {collection_id} not found")
            
        # Ensure the QA pair has the collection_id
        qa_pair_data["collection_id"] = collection_id
        
        # Add the QA pair
        qa_pairs_db = get_memory_database("qa_pairs")
        qa_pair = await qa_pairs_db.insert_one(qa_pair_data)
        
        # Update the QA pair count in the collection
        collection_qa_pairs = await self.list_qa_pairs(collection_id)
        await self.update_collection(collection_id, {"qa_pair_count": len(collection_qa_pairs)})
        
        logger.info(f"Added QA pair {qa_pair.get('id')} to collection {collection_id}")
        return qa_pair
        
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
        logger.info(f"Updating QA pair {qa_pair_id} in collection {collection_id}")
        
        # Verify the collection exists
        collection = await self.find_one({"id": collection_id})
        if not collection:
            logger.error(f"Collection {collection_id} not found")
            raise ValueError(f"Collection {collection_id} not found")
            
        # Verify the QA pair exists
        qa_pair = await self.get_qa_pair(collection_id, qa_pair_id)
        if not qa_pair:
            logger.error(f"QA pair {qa_pair_id} not found in collection {collection_id}")
            raise ValueError(f"QA pair {qa_pair_id} not found in collection {collection_id}")
            
        # Ensure the collection_id and id fields are preserved
        qa_pair_data["collection_id"] = collection_id
        qa_pair_data["id"] = qa_pair_id
        
        # Update the QA pair
        qa_pairs_db = get_memory_database("qa_pairs")
        updated_qa_pair = await qa_pairs_db.update_one({"id": qa_pair_id}, qa_pair_data)
        
        logger.info(f"Updated QA pair {qa_pair_id} in collection {collection_id}")
        return updated_qa_pair
        
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
        logger.info(f"Deleting QA pair {qa_pair_id} from collection {collection_id}")
        
        # Verify the collection exists
        collection = await self.find_one({"id": collection_id})
        if not collection:
            logger.error(f"Collection {collection_id} not found")
            raise ValueError(f"Collection {collection_id} not found")
            
        # Verify the QA pair exists and belongs to the collection
        qa_pair = await self.get_qa_pair(collection_id, qa_pair_id)
        if not qa_pair:
            logger.error(f"QA pair {qa_pair_id} not found in collection {collection_id}")
            raise ValueError(f"QA pair {qa_pair_id} not found in collection {collection_id}")
            
        # Delete the QA pair
        qa_pairs_db = get_memory_database("qa_pairs")
        deleted = await qa_pairs_db.delete_one({"id": qa_pair_id})
        
        if not deleted:
            logger.error(f"Failed to delete QA pair {qa_pair_id}")
            raise ValueError(f"Failed to delete QA pair {qa_pair_id}")
            
        # Update the QA pair count in the collection
        collection_qa_pairs = await self.list_qa_pairs(collection_id)
        await self.update_collection(collection_id, {"qa_pair_count": len(collection_qa_pairs)})
        
        logger.info(f"Deleted QA pair {qa_pair_id} from collection {collection_id}")
        return qa_pair
        
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
        logger.info(f"Updating collection {collection_id}")
        
        # Verify the collection exists
        collection = await self.find_one({"id": collection_id})
        if not collection:
            logger.error(f"Collection {collection_id} not found")
            raise ValueError(f"Collection {collection_id} not found")
            
        # Ensure the ID is preserved
        collection_data["id"] = collection_id
        
        # Update the collection
        updated_collection = await self.update_one({"id": collection_id}, collection_data)
        
        if not updated_collection:
            logger.error(f"Failed to update collection {collection_id}")
            raise ValueError(f"Failed to update collection {collection_id}")
            
        logger.info(f"Updated collection {collection_id}")
        return updated_collection
        
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
        logger.info(f"Deleting collection {collection_id}")
        
        # Verify the collection exists
        collection = await self.find_one({"id": collection_id})
        if not collection:
            logger.error(f"Collection {collection_id} not found")
            raise ValueError(f"Collection {collection_id} not found")
            
        # Delete all QA pairs in the collection
        qa_pairs_db = get_memory_database("qa_pairs")
        qa_pairs = await qa_pairs_db.find_all({"collection_id": collection_id})
        
        for qa_pair in qa_pairs:
            await qa_pairs_db.delete_one({"id": qa_pair["id"]})
            
        # Delete the collection
        deleted = await self.delete_one({"id": collection_id})
        
        if not deleted:
            logger.error(f"Failed to delete collection {collection_id}")
            raise ValueError(f"Failed to delete collection {collection_id}")
            
        logger.info(f"Deleted collection {collection_id} and {len(qa_pairs)} QA pairs")
        return collection

def get_memory_database(collection_name: str) -> MemoryDatabase:
    """
    Get a memory database instance for the specified collection.
    
    Args:
        collection_name: The name of the collection to operate on.
        
    Returns:
        MemoryDatabase: A memory database instance for the specified collection.
    """
    return MemoryDatabase(collection_name)
