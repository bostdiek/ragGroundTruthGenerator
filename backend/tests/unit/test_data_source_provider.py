"""
Unit tests for the data source provider.
"""

import pytest

from providers.data_sources.base import BaseDataSourceProvider
from providers.data_sources.memory import MemoryDataSourceProvider


class TestMemoryDataSourceProvider:
    """Tests for the MemoryDataSourceProvider implementation."""

    def setup_method(self):
        """Set up the test environment."""
        self.provider = MemoryDataSourceProvider()

    def test_provider_interface(self):
        """Test that the provider implements the required interface."""
        assert isinstance(self.provider, BaseDataSourceProvider)

    def test_get_id(self):
        """Test that the provider returns the correct ID."""
        assert self.provider.get_id() == "memory"

    def test_get_name(self):
        """Test that the provider returns a non-empty name."""
        assert self.provider.get_name() != ""

    def test_get_description(self):
        """Test that the provider returns a non-empty description."""
        assert self.provider.get_description() != ""

    @pytest.mark.asyncio
    async def test_search_documents(self):
        """Test searching for documents."""
        # The memory provider should return at least some demo documents
        result = await self.provider.retrieve_documents("test query", limit=5)

        assert isinstance(result, list)
        assert len(result) > 0

        # Each document should have at minimum these fields
        for doc in result:
            assert "id" in doc
            assert "title" in doc
            assert "content" in doc

    @pytest.mark.asyncio
    async def test_get_document(self):
        """Test getting a document by ID."""
        # First search to get a document ID
        docs = await self.provider.retrieve_documents("test", limit=1)
        assert len(docs) > 0

        doc_id = docs[0]["id"]

        # Then get the document by ID
        document = await self.provider.get_document(doc_id)

        assert document["id"] == doc_id
        assert "title" in document
        assert "content" in document
