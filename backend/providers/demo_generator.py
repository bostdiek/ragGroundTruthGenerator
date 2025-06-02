"""
Demo Generator for the AI Ground Truth Generator.

This module implements a simple demo generator that returns lorem ipsum text
for questions, with modifications based on custom rules.
"""
from typing import Any, Dict, List


class DemoGenerator:
    """
    A simple demo generator implementation.
    
    This generator returns lorem ipsum text for questions without rules,
    and a modified response when rules are applied.
    """
    
    def __init__(self):
        """Initialize the demo generator."""
        self.lorem_ipsum = """
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
"""
    
    async def generate_answer(
        self, 
        question: str, 
        documents: List[Dict[str, Any]] = None,
        custom_rules: List[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate a simple demo answer.
        
        Args:
            question: The question to answer (used in the response)
            documents: List of documents (used to generate references)
            custom_rules: Custom rules (determines response format)
            **kwargs: Additional parameters not used in the demo
            
        Returns:
            Dict[str, Any]: The generated answer and metadata
        """
        if documents is None:
            documents = []
            
        if custom_rules is None:
            custom_rules = []
        
        # Base answer with question acknowledgment and lorem ipsum
        answer = f"# Answer to: {question}\n\n{self.lorem_ipsum}\n\n"
        
        # Add document references if available
        if documents:
            answer += "## References\n"
            for i, doc in enumerate(documents):
                doc_name = doc.get("name", f"Document {i+1}")
                answer += f"- [{i+1}] {doc_name}\n"
        
        # If custom rules are provided, add a special section
        if custom_rules:
            answer += "\n## Special Response for Rules\n\n"
            answer += "This answer has been modified according to the following rules:\n\n"
            for rule in custom_rules:
                answer += f"- {rule}\n"
            
            # Add some extra text to show difference when rules are applied
            answer += "\nWhen rules are applied, the answer is more structured and focused."
    
        # Calculate approximate token count - this is a rough estimate
        # In a real implementation, you would use a proper tokenizer
        word_count = len(answer.split())
        prompt_tokens = len(question.split()) + sum(len(str(doc).split()) for doc in documents)
        completion_tokens = word_count
            
        return {
            "answer": answer,
            "model": "demo-model",
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "documents_used": len(documents),
            "custom_rules_applied": len(custom_rules)
        }


def get_generator() -> DemoGenerator:
    """Get a demo generator instance."""
    return DemoGenerator()
