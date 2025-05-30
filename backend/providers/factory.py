"""
Provider factory for the AI Ground Truth Generator.

This module provides factory functions to get the appropriate provider
implementations based on the environment configuration.
"""
import os
from typing import Any

# Get provider configuration from environment variables
generation_provider = os.getenv("GENERATION_PROVIDER", "template")
retrieval_provider = os.getenv("RETRIEVAL_PROVIDER", "template")

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
