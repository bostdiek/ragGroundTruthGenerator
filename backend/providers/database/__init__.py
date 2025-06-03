"""
Database providers package for the AI Ground Truth Generator.

This package contains interfaces and implementations for database providers.
"""
import os
from typing import Any

# Get the database provider from environment variables
database_provider = os.getenv("DATABASE_PROVIDER", "memory")

def get_database(collection_name: str) -> Any:
    """
    Get a database instance for the specified collection.
    
    Args:
        collection_name: The name of the collection to operate on.
        
    Returns:
        Any: A database instance for the specified collection.
    """
    if database_provider == "memory":
        from providers.database.memory import get_memory_database
        return get_memory_database(collection_name)
    # TODO: Add other database providers
    # elif database_provider == "mongodb":
    #     from providers.database.mongodb import get_mongodb_database
    #     return get_mongodb_database(collection_name)
    # elif database_provider == "cosmosdb":
    #     from providers.database.cosmosdb import get_cosmosdb_database
    #     return get_cosmosdb_database(collection_name)
    else:
        # Default to memory if provider not supported
        from providers.database.memory import get_memory_database
        return get_memory_database(collection_name)
