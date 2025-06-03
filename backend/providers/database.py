"""
Database provider factory for the AI Ground Truth Generator.

This module provides a factory function to get the appropriate database provider
based on the environment configuration.
"""

import logging
import os
from typing import Any

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the database provider from environment variables
database_provider = os.getenv("DATABASE_PROVIDER", "memory")
logger.info(f"Using database provider: {database_provider}")


def get_database(collection_name: str) -> Any:
    """
    Get a database instance for the specified collection.

    Args:
        collection_name: The name of the collection to operate on.

    Returns:
        Any: A database instance for the specified collection.
    """
    logger.info(f"Getting database for collection: {collection_name}")
    logger.info(f"Using database provider: {database_provider}")

    if database_provider == "memory":
        try:
            from providers.database.memory import get_memory_database

            logger.info("Using memory database with improved filtering")
            return get_memory_database(collection_name)
        except ImportError:
            logger.warning(
                "Memory database not found, falling back to legacy memory database"
            )
            from providers.memory_db import get_database as get_legacy_memory_db

            return get_legacy_memory_db(collection_name)
    # TODO: Add other database providers
    # elif database_provider == "mongodb":
    #     from providers.mongodb import get_database as get_mongodb
    #     return get_mongodb(collection_name)
    # elif database_provider == "cosmosdb":
    #     from providers.cosmosdb import get_database as get_cosmosdb
    #     return get_cosmosdb(collection_name)
    else:
        logger.warning(
            f"Unsupported DATABASE_PROVIDER: {database_provider}, falling back to memory"
        )
        try:
            from providers.database.memory import get_memory_database

            return get_memory_database(collection_name)
        except ImportError:
            logger.warning(
                "Memory database not found, falling back to legacy memory database"
            )
            from providers.memory_db import get_database as get_legacy_memory_db

            return get_legacy_memory_db(collection_name)
