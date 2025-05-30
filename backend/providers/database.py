"""
Database provider factory for the AI Ground Truth Generator.

This module provides a factory function to get the appropriate database provider
based on the environment configuration.
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
        from providers.memory_db import get_database as get_memory_db
        return get_memory_db(collection_name)
    # TODO: Add other database providers
    # elif database_provider == "mongodb":
    #     from providers.mongodb import get_database as get_mongodb
    #     return get_mongodb(collection_name)
    # elif database_provider == "cosmosdb":
    #     from providers.cosmosdb import get_database as get_cosmosdb
    #     return get_cosmosdb(collection_name)
    else:
        raise ValueError(f"Unsupported DATABASE_PROVIDER: {database_provider}")
