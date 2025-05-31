"""
Simple template generation provider for development.

This module provides a simple template-based generation provider for development.
In production, replace this with your actual generation implementation.
"""
from typing import Any, Dict, List, Optional


class TemplateGenerator:
    """
    A simple template-based generator implementation for development.
    
    This class provides a basic implementation for generating answers based on templates.
    In production, replace this with your actual AI service implementation.
    """
    
    def __init__(self):
        """Initialize the template generator."""
        pass
    
    async def generate_answer(
        self, 
        question: str, 
        documents: List[Dict[str, Any]] = None,
        custom_rules: List[str] = None
    ) -> Dict[str, Any]:
        """
        Generate an answer for a question using templates.
        
        Args:
            question: The question to generate an answer for.
            documents: Optional list of documents to reference.
            custom_rules: Optional list of custom rules to apply.
            
        Returns:
            Dict[str, Any]: The generated answer and metadata.
        """
        # Simple template-based generation for development
        if not documents:
            documents = []
            
        if not custom_rules:
            custom_rules = []
            
        # Template answer based on question
        if "what" in question.lower():
            answer = f"This is a template answer to your 'what' question: '{question}'"
        elif "how" in question.lower():
            answer = f"This is a template answer to your 'how' question: '{question}'"
        elif "why" in question.lower():
            answer = f"This is a template answer to your 'why' question: '{question}'"
        else:
            answer = f"This is a generic template answer to your question: '{question}'"
            
        # Add references to documents if provided
        doc_references = []
        if documents:
            for i, doc in enumerate(documents):
                doc_name = doc.get("name", f"Document {i+1}")
                doc_references.append(f"[{i+1}] Reference: {doc_name}")
                
        # Format the answer with references
        if doc_references:
            answer += "\n\nReferences:\n" + "\n".join(doc_references)
            
        # Apply custom rules if provided
        if custom_rules:
            answer += "\n\nNote: This answer follows these custom rules:\n"
            answer += "\n".join(f"- {rule}" for rule in custom_rules)
            
        return {
            "answer": answer,
            "model": "template-model",
            "confidence": 0.8,
            "tokens": len(answer.split()),
            "documents_used": len(documents),
            "custom_rules_applied": len(custom_rules)
        }

def get_generator() -> TemplateGenerator:
    """
    Get a template generator instance.
    
    Returns:
        TemplateGenerator: A template generator instance.
    """
    return TemplateGenerator()
