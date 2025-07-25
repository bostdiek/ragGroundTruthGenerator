"""
Provider factory for the AI Ground Truth Generator.

This module provides factory functions to get the appropriate provider
implementations based on the environment configuration.
"""

import os
from typing import Any

# Get provider configuration from environment variables
generation_provider = os.getenv("GENERATION_PROVIDER", "demo")
database_provider = os.getenv("DATABASE_PROVIDER", "memory")
enabled_data_sources = os.getenv("ENABLED_DATA_SOURCES", "memory").split(",")


def get_generator() -> Any:
    """
    Get a generator instance based on environment configuration.

    Returns:
        Any: A generator instance.
    """
    if generation_provider == "demo":
        from providers.generation.demo import get_generator as get_demo_generator

        return get_demo_generator()
    # TODO: Add other generation providers
    # elif generation_provider == "azure-openai":
    #     from providers.generation.azure_openai import get_generator as get_azure_generator
    #     return get_azure_generator()
    # elif generation_provider == "openai":
    #     from providers.generation.openai import get_generator as get_openai_generator
    #     return get_openai_generator()
    else:
        raise ValueError(f"Unsupported GENERATION_PROVIDER: {generation_provider}")


def get_data_source_provider(provider_id: str) -> Any:
    """
    Get a data source provider instance by ID.

    A data source provider is responsible for retrieving documents from
    a specific data source, such as a memory store, file system, database,
    or external API. Each provider implements the BaseDataSourceProvider interface.

    Args:
        provider_id: The ID of the provider to retrieve

    Returns:
        A data source provider instance

    Raises:
        ValueError: If the specified provider ID is not supported
    """
    if provider_id == "memory":
        from providers.data_sources.memory import get_provider as get_memory_provider

        return get_memory_provider()
    # TODO: Add other data source providers
    # elif provider_id == "azure_search":
    #     from providers.data_sources.azure_search import get_provider as get_azure_search_provider
    #     return get_azure_search_provider()
    # elif provider_id == "database":
    #     from providers.data_sources.database import get_provider as get_database_provider
    #     return get_database_provider()
    else:
        raise ValueError(f"Unknown data source provider: {provider_id}")


def get_all_data_source_providers() -> dict[str, Any]:
    """
    Get all enabled data source providers.

    This function returns a dictionary of all enabled data source providers,
    as specified by the ENABLED_DATA_SOURCES environment variable. Each provider
    is instantiated and added to the dictionary with its ID as the key.

    Providers that cannot be instantiated (e.g., due to missing dependencies)
    are skipped with a warning.

    Returns:
        A dictionary of provider IDs to provider instances
    """
    providers = {}

    for provider_id in enabled_data_sources:
        try:
            provider = get_data_source_provider(provider_id.strip())
            providers[provider.get_id()] = provider
        except Exception as e:
            print(
                f"Warning: Could not instantiate data source provider '{provider_id}': {e}"
            )

    return providers


def get_auth_provider() -> Any:
    """
    Get an authentication provider instance based on environment configuration.

    Returns:
        Any: An authentication provider instance.
    """
    auth_provider = os.getenv("AUTH_PROVIDER", "simple")

    if auth_provider == "simple":
        from providers.auth.simple_auth import get_provider as get_simple_auth_provider

        return get_simple_auth_provider()
    # TODO: Add other authentication providers
    # elif auth_provider == "azure-ad":
    #     from providers.auth.azure_ad import get_provider as get_azure_ad_provider
    #     return get_azure_ad_provider()
    # elif auth_provider == "oauth":
    #     from providers.auth.oauth import get_provider as get_oauth_provider
    #     return get_oauth_provider()
    else:
        raise ValueError(f"Unsupported AUTH_PROVIDER: {auth_provider}")


def get_database(collection_name: str) -> Any:
    """
    Get a database instance for the specified collection based on environment configuration.

    Args:
        collection_name: The name of the collection to operate on.

    Returns:
        Any: A database instance for the specified collection.

    Raises:
        ValueError: If the specified database provider is not supported.
    """
    if database_provider == "memory":
        from providers.database.memory import get_memory_database
        return get_memory_database(collection_name)
    # TODO: Add other database providers
    # elif database_provider == "mongodb":
    #     from providers.database.mongodb import get_database as get_mongodb
    #     return get_mongodb(collection_name)
    # elif database_provider == "cosmosdb":
    #     from providers.database.cosmosdb import get_database as get_cosmosdb
    #     return get_cosmosdb(collection_name)
    else:
        raise ValueError(f"Unsupported DATABASE_PROVIDER: {database_provider}")
