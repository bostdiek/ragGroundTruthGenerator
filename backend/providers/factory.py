"""
Provider factory for the AI Ground Truth Generator.

This module provides factory functions to get the appropriate provider
implementations based on the environment configuration.
"""
import os
from typing import Any, Dict

# Get provider configuration from environment variables
generation_provider = os.getenv("GENERATION_PROVIDER", "template")
retrieval_provider = os.getenv("RETRIEVAL_PROVIDER", "template")
enabled_data_sources = os.getenv("ENABLED_DATA_SOURCES", "memory").split(",")

def get_generator() -> Any:
    """
    Get a generator instance based on environment configuration.
    
    Returns:
        Any: A generator instance.
    """
    if generation_provider == "template":
        from providers.template_generator import get_generator as get_template_generator
        return get_template_generator()
    # TODO: Add other generation providers
    # elif generation_provider == "azure-openai":
    #     from providers.azure_openai import get_generator as get_azure_generator
    #     return get_azure_generator()
    # elif generation_provider == "openai":
    #     from providers.openai import get_generator as get_openai_generator
    #     return get_openai_generator()
    else:
        raise ValueError(f"Unsupported GENERATION_PROVIDER: {generation_provider}")

def get_retriever() -> Any:
    """
    Get a retriever instance based on environment configuration.
    
    Returns:
        Any: A retriever instance.
    """
    if retrieval_provider == "template":
        from providers.template_retriever import get_retriever as get_template_retriever
        return get_template_retriever()
    # TODO: Add other retrieval providers
    # elif retrieval_provider == "azure-search":
    #     from providers.azure_search import get_retriever as get_azure_search
    #     return get_azure_search()
    # elif retrieval_provider == "elasticsearch":
    #     from providers.elasticsearch import get_retriever as get_elasticsearch
    #     return get_elasticsearch()
    else:
        raise ValueError(f"Unsupported RETRIEVAL_PROVIDER: {retrieval_provider}")

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
        from providers.memory_data_source_provider import (
            get_provider as get_memory_provider,
        )
        return get_memory_provider()
    # TODO: Add other data source providers
    # elif provider_id == "azure_search":
    #     from providers.azure_search_provider import get_provider as get_azure_search_provider
    #     return get_azure_search_provider()
    # elif provider_id == "database":
    #     from providers.database_provider import get_provider as get_database_provider
    #     return get_database_provider()
    else:
        raise ValueError(f"Unknown data source provider: {provider_id}")

def get_all_data_source_providers() -> Dict[str, Any]:
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
            providers[provider_id] = get_data_source_provider(provider_id)
        except ValueError:
            # Skip unavailable providers
            continue
    
    return providers
