"""
Base generator provider interface for the AI Ground Truth Generator.

This module defines the interface that all generator providers must implement.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseGenerator(ABC):
    """
    Base interface for all generator providers.
    
    This abstract class defines the interface that all generator providers
    must implement. A generator provider is responsible for generating
    answers to questions based on provided documents and rules.
    
    To implement a custom generator provider:
    1. Create a new class that inherits from BaseGenerator
    2. Implement all the abstract methods
    3. Register the provider in the factory module
    """
    
    @abstractmethod
    async def generate_answer(
        self, 
        question: str, 
        documents: List[Dict[str, Any]], 
        custom_rules: Optional[List[str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate an answer to a question.
        
        Args:
            question: The question to answer
            documents: List of documents to use as context
            custom_rules: List of custom rules to apply
            **kwargs: Additional generation parameters
            
        Returns:
            Dict[str, Any]: The generated answer, including at minimum:
                - answer: The generated answer text
                - model_used: The model used for generation
                
        Raises:
            Exception: If generation fails
        """
        pass
