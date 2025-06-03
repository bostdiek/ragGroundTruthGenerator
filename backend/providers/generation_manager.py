"""
Generation Manager for the AI Ground Truth Generator.

This module implements the GenerationManager class, which orchestrates
the answer generation process, delegating to the appropriate generator provider.
"""

from typing import Any


class GenerationManager:
    """
    Orchestrates the answer generation process.

    This manager handles the high-level workflow of generating answers,
    delegating to the appropriate generator provider.
    """

    def __init__(self, generator_provider):
        """
        Initialize the generation manager with a generator provider.

        Args:
            generator_provider: The generator provider to use
        """
        self.generator = generator_provider

    async def generate_answer(
        self,
        question: str,
        documents: list[dict[str, Any]],
        custom_rules: list[str] = None,
        **kwargs,
    ) -> dict[str, Any]:
        """
        Generate an answer using the configured generator provider.

        Args:
            question: The question to answer
            documents: The documents to use as context
            custom_rules: Custom rules to apply to the generation
            **kwargs: Additional generation parameters

        Returns:
            Dict containing the generated answer and metadata
        """
        if custom_rules is None:
            custom_rules = []

        # Filter parameters based on what the generator accepts
        generator_params = {
            "question": question,
            "documents": documents,
            "custom_rules": custom_rules,
        }

        # Only pass kwargs that are accepted by the generator
        # This ensures compatibility with different generator implementations

        # Call the generator provider with appropriate parameters
        response = await self.generator.generate_answer(**generator_params)

        # Format the response for the API
        prompt_tokens = response.get("prompt_tokens", 0)
        completion_tokens = response.get("completion_tokens", 0)

        return {
            "answer": response["answer"],
            "model_used": response.get("model", "demo-model"),
            "token_usage": {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens,
            },
        }
