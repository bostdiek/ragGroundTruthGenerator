"""
Database providers package for the AI Ground Truth Generator.

This package contains interfaces and implementations for database providers.

For database instances, use providers.factory.get_database() directly.
"""

# Re-export key classes for convenience
from .base import BaseDatabase

__all__ = ["BaseDatabase"]
