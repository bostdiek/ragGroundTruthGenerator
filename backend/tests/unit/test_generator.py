"""
Unit tests for the generator provider.
"""
import pytest

from providers.generation.base import BaseGenerator
from providers.generation.demo import DemoGenerator

class TestDemoGenerator:
    """Tests for the DemoGenerator implementation."""
    
    def setup_method(self):
        """Set up the test environment."""
        self.generator = DemoGenerator()
    
    def test_generator_interface(self):
        """Test that the generator implements the required interface."""
        assert isinstance(self.generator, BaseGenerator)
    
    @pytest.mark.asyncio
    async def test_generate_answer(self):
        """Test generating an answer."""
        # Create a test question and documents
        question = "What is the capital of France?"
        documents = [
            {
                "id": "doc1",
                "title": "France",
                "content": "France is a country in Western Europe. Its capital is Paris."
            }
        ]
        
        # Generate an answer
        result = await self.generator.generate_answer(question, documents)
        
        # Check the response format
        assert "answer" in result
        assert isinstance(result["answer"], str)
        assert "model" in result
        assert len(result["answer"]) > 0
    
    @pytest.mark.asyncio
    async def test_generate_answer_with_rules(self):
        """Test generating an answer with custom rules."""
        # Create a test question, documents, and rules
        question = "What is the capital of France?"
        documents = [
            {
                "id": "doc1",
                "title": "France",
                "content": "France is a country in Western Europe. Its capital is Paris."
            }
        ]
        custom_rules = ["Answer with exactly one sentence.", "Include the word 'capital' in your answer."]
        
        # Generate an answer with custom rules
        result = await self.generator.generate_answer(question, documents, custom_rules=custom_rules)
        
        # Check the response format
        assert "answer" in result
        assert isinstance(result["answer"], str)
        assert "model" in result
        assert len(result["answer"]) > 0
    
    @pytest.mark.asyncio
    async def test_generate_answer_no_documents(self):
        """Test generating an answer with no documents."""
        # Create a test question but no documents
        question = "What is the capital of France?"
        documents = []
        
        # Generate an answer
        result = await self.generator.generate_answer(question, documents)
        
        # Check the response format
        assert "answer" in result
        assert isinstance(result["answer"], str)
        assert "model" in result
