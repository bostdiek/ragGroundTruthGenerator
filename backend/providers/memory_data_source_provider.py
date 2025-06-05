"""
Memory-based data source provider for the AI Ground Truth Generator.

This module provides a simple in-memory data source provider for development and demonstration.
It serves as a reference implementation for creating new data source providers.

To create your own data source provider:
1. Create a new Python file in the providers directory
2. Import BaseDataSourceProvider from base_data_source_provider
3. Create a class that inherits from BaseDataSourceProvider
4. Implement all required methods (get_name, get_description, get_id, retrieve_documents)
5. Add a get_provider function that returns an instance of your provider
6. Update factory.py to include your new provider

Example use cases for custom data source providers:
- Searching documents in a database
- Retrieving content from an API
- Querying a search engine like Elasticsearch or Azure Cognitive Search
- Accessing files in cloud storage (S3, Azure Blob Storage, etc.)
"""

from typing import Any

from providers.base_data_source_provider import BaseDataSourceProvider


class MemoryDataSourceProvider(BaseDataSourceProvider):
    """
    A provider that searches through in-memory documents.

    This provider is intended for development and demonstration purposes.
    It holds a collection of sample documents in memory and performs
    simple text matching to simulate a search.
    """

    def __init__(self):
        """
        Initialize the memory provider with sample documents.

        This is a simple in-memory document store that demonstrates
        how to implement a data source provider. In a real-world scenario,
        you would likely replace this with a provider that connects to
        a database, API, or other external data source.

        To extend this example:
        1. Add more documents to the self.documents list
        2. Enhance the search algorithm in retrieve_documents
        3. Add support for more advanced filters
        """
        self.documents = [
            {
                "id": "doc1",
                "title": "Equipment Maintenance Manual",
                "content": "Regular maintenance of equipment is essential for optimal performance. "
                + "This document outlines maintenance procedures for various equipment types.",
                "url": "https://example.com/docs/equipment-manual.pdf",
                "metadata": {
                    "type": "manual",
                    "topic": "maintenance",
                    "equipment_type": "general",
                    "created_date": "2023-01-15",
                    "status": "approved",
                },
            },
            {
                "id": "doc2",
                "title": "Troubleshooting Guide: Air Filters",
                "content": "Common issues with air filters include clogging, improper installation, "
                + "and insufficient airflow. This guide provides step-by-step troubleshooting "
                + "procedures for identifying and resolving air filter problems.",
                "url": "https://example.com/docs/airfilter-guide.pdf",
                "metadata": {
                    "type": "guide",
                    "topic": "troubleshooting",
                    "component": "air filter",
                    "created_date": "2023-03-22",
                },
            },
            {
                "id": "doc3",
                "title": "Safety Protocols for Equipment Operation",
                "content": "Safety is paramount when operating industrial equipment. This document "
                + "covers essential safety protocols, including personal protective equipment, "
                + "pre-operation checks, and emergency procedures.",
                "url": "https://example.com/docs/safety-protocols.pdf",
                "metadata": {
                    "type": "protocol",
                    "topic": "safety",
                    "importance": "critical",
                    "created_date": "2023-05-10",
                },
            },
            {
                "id": "doc4",
                "title": "Technical Specifications: Model X Series",
                "content": "Technical specifications for the Model X series include power requirements, "
                + "dimensional constraints, operating conditions, and performance metrics. "
                + "Reference this document when planning installations or upgrades.",
                "url": "https://example.com/docs/modelx-specs.pdf",
                "metadata": {
                    "type": "specifications",
                    "topic": "technical",
                    "model": "Model X",
                    "created_date": "2023-02-07",
                },
            },
            {
                "id": "doc5",
                "title": "AI Ground Truth Generation Best Practices",
                "content": "Creating high-quality ground truth data is essential for training effective "
                + "AI models. This document covers best practices for data annotation, quality "
                + "control, and dataset management to ensure optimal model performance.",
                "url": "https://example.com/docs/ai-ground-truth-best-practices.pdf",
                "metadata": {
                    "type": "guide",
                    "topic": "ai",
                    "subtopic": "data preparation",
                    "created_date": "2023-06-15",
                },
            },
            {
                "id": "doc6",
                "title": "Data Annotation Guidelines for Machine Learning",
                "content": "Proper data annotation is crucial for developing accurate machine learning models. "
                + "This document provides guidelines for consistent, high-quality annotations across "
                + "different data types including text, images, and audio.",
                "url": "https://example.com/docs/data-annotation-guidelines.pdf",
                "metadata": {
                    "type": "guidelines",
                    "topic": "data annotation",
                    "subtopic": "machine learning",
                    "created_date": "2023-07-20",
                },
            },
        ]

    def get_name(self) -> str:
        """Return the name of this data source."""
        return "In Memory Documents"

    def get_description(self) -> str:
        """Return a description of this data source."""
        return "Search through sample documents stored in memory for demonstration purposes"

    def get_id(self) -> str:
        """Return the unique identifier for this data source."""
        # This ID must match what's expected by the frontend
        return "memory"

    async def retrieve_documents(
        self, query: str, filters: dict[str, Any] | None = None, limit: int = 5
    ) -> list[dict[str, Any]]:
        """
        Retrieve documents matching the query.

        This method demonstrates a simple search algorithm that looks for
        the query string in both the title and content of each document.
        In a real-world implementation, you would replace this with a more
        sophisticated search algorithm, potentially using:

        - Full-text search
        - Vector embeddings for semantic search
        - Query parsing for complex filters
        - Relevance scoring based on multiple factors

        Args:
            query: The search query
            filters: Optional filters to apply (example: {"type": "manual"})
            limit: Maximum number of results to return

        Returns:
            A list of matching documents with source attribution and relevance scores
        """
        if self.documents is None:
            self.documents = self._load_documents()
        query = query.lower()
        # Split the query into words for better matching
        query_terms = [
            term for term in query.split() if len(term) > 2
        ]  # Only use terms with >2 chars
        all_results = []

        for doc in self.documents:
            # Create a copy of the document to avoid modifying the original
            result = doc.copy()

            # Add source attribution
            result["source"] = {
                "id": self.get_id(),
                "name": self.get_name(),
                "type": "sample",
            }

            # Apply filters if specified
            if filters:
                skip = False
                for key, value in filters.items():
                    metadata_value = doc.get("metadata", {}).get(key)
                    if metadata_value is not None and metadata_value != value:
                        skip = True
                        break
                if skip:
                    continue

            # Count matches for each term in the title and content
            title_lower = doc["title"].lower()
            content_lower = doc["content"].lower()

            # Check for exact query match first (highest relevance)
            exact_title_match = query in title_lower
            exact_content_match = query in content_lower

            # Count term matches and occurrences
            title_term_count = sum(title_lower.count(term) for term in query_terms)
            content_term_count = sum(content_lower.count(term) for term in query_terms)

            # Calculate a relevance score
            if exact_title_match:
                relevance_score = 0.95  # Exact match in title is highest
            elif exact_content_match:
                relevance_score = 0.85  # Exact match in content is next highest
            elif title_term_count > 0 or content_term_count > 0:
                # If we have some term matches, use the counts to determine score
                # Weight title matches more heavily (3x)
                weighted_count = (title_term_count * 3) + content_term_count

                # Scale the score based on the weighted count
                # More occurrences = higher score
                relevance_score = min(0.8, 0.3 + (weighted_count * 0.05))
            else:
                # Even with no matches, assign a varied low baseline score based on document ID
                # This ensures variety in results even with low/no relevance
                # Using hash of document ID to ensure consistent but varied scores
                doc_id_hash = hash(doc["id"]) % 100  # Get last 2 digits of hash
                relevance_score = 0.1 + (doc_id_hash / 1000)  # Range from 0.1 to 0.199

            # Assign the relevance score
            result["relevance_score"] = relevance_score

            # Always add to results, even with low scores
            all_results.append(result)

        # Sort by relevance score
        all_results.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Return up to the specified limit
        return all_results[:limit]

    async def get_document(self, document_id: str) -> dict[str, Any]:
        """
        Get a document by ID.

        Args:
            document_id: The ID of the document to retrieve

        Returns:
            Dict[str, Any]: The document data

        Raises:
            HTTPException: If the document is not found
        """
        for doc in self.documents:
            if doc["id"] == document_id:
                # Create a copy of the document to avoid modifying the original
                result = doc.copy()

                # Add source attribution
                result["source"] = {
                    "id": self.get_id(),
                    "name": self.get_name(),
                    "type": "sample",
                }

                return result

        # If document not found, raise an exception
        from fastapi import HTTPException, status

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found",
        )


def get_provider():
    """Get an instance of the memory data source provider."""
    return MemoryDataSourceProvider()
