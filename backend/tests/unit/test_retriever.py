"""
Unit tests for the retriever provider.
"""
import pytest

from providers.retrieval.base import BaseRetriever
from providers.retrieval.template import TemplateRetriever

class TestTemplateRetriever:
    """Tests for the TemplateRetriever implementation."""
    
    def setup_method(self):
        """Set up the test environment."""
        self.retriever = TemplateRetriever()
    
    def test_retriever_interface(self):
        """Test that the retriever implements the required interface."""
        assert isinstance(self.retriever, BaseRetriever)
    
    @pytest.mark.asyncio
    async def test_list_templates(self):
        """Test listing templates."""
        templates = await self.retriever.list_templates()
        
        assert isinstance(templates, list)
        assert len(templates) > 0
        
        # Each template should have these fields
        for template in templates:
            assert "id" in template
            assert "name" in template
            assert "description" in template
            assert "fields" in template
            assert isinstance(template["fields"], list)
    
    @pytest.mark.asyncio
    async def test_get_template(self):
        """Test getting a template by ID."""
        # First list templates to get an ID
        templates = await self.retriever.list_templates()
        assert len(templates) > 0
        
        template_id = templates[0]["id"]
        
        # Then get the template by ID
        template = await self.retriever.get_template(template_id)
        
        assert template["id"] == template_id
        assert "name" in template
        assert "description" in template
        assert "fields" in template
        assert isinstance(template["fields"], list)
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_template(self):
        """Test getting a nonexistent template."""
        with pytest.raises(Exception):
            await self.retriever.get_template("nonexistent_template")
