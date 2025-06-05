"""
Demo Generator for the AI Ground Truth Generator.

This module implements a simple demo generator that returns lorem ipsum text
for questions, with modifications based on custom rules.
"""

from typing import Any

from providers.generation.base import BaseGenerator


class DemoGenerator(BaseGenerator):
    """
    A simple demo generator implementation.

    This generator returns lorem ipsum text for questions without rules,
    and a modified response when rules are applied.
    """

    def __init__(self):
        """Initialize the demo generator."""
        self.lorem_ipsum = """
# Demo Generator Lorem Ipsum Text

The answer is formatted in markdown

## Lorem Ipsum

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
"""

    async def generate_answer(
        self,
        question: str,
        documents: list[dict[str, Any]] = None,
        custom_rules: list[str] = None,
        **kwargs,
    ) -> dict[str, Any]:
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

        # Start with the base lorem ipsum text
        answer = self.lorem_ipsum.strip()

        # Add references to documents if provided
        if documents:
            answer += "\n\nReferences:\n"
            for i, doc in enumerate(documents, 1):
                answer += f"{i}. {doc.get('title', 'Untitled Document')}\n"

        # Apply custom rules if provided
        if custom_rules:
            answer = (
                f"Based on the following rules: {', '.join(custom_rules)}\n\n{answer}"
            )

        # Add question context
        answer = f"Answer to the question: '{question}'\n\n{answer}"

        # Return the answer with metadata
        return {
            "answer": answer,
            "model": "demo-model",
            "prompt_tokens": len(question)
            + sum(len(d.get("content", "")) for d in documents),
            "completion_tokens": len(answer),
            "finish_reason": "stop",
        }


def get_generator() -> DemoGenerator:
    """
    Get a DemoGenerator instance.

    Returns:
        DemoGenerator: A demo generator instance
    """
    return DemoGenerator()
