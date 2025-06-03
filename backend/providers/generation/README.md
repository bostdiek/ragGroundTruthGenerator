# Generation Providers

This directory contains generation providers for the AI Ground Truth Generator. Generation providers are responsible for generating answers to questions using document context.

## Provider Interface

All generation providers must implement the `BaseGeneratorProvider` interface defined in `base.py`. This interface includes methods for:

- Getting provider metadata (name, description, ID)
- Generating answers based on questions and document context
- Applying generation templates

## Generation Model

The generation system revolves around questions, documents, and answers:

```json
{
  "question": "How do I reset the equipment?",
  "documents": [
    {
      "id": "doc-id",
      "title": "Equipment Manual",
      "content": "Section on troubleshooting steps for common issues. Power cycle procedures are outlined on page 42.",
      "source": {
        "id": "source-id",
        "name": "Source Name",
        "type": "source-type"
      },
      "url": "optional-url",
      "metadata": {}
    }
  ],
  "template": {
    "id": "template-id",
    "name": "Template Name",
    "prompt": "Based on the following documents, please answer the question: {question}",
    "parameters": {}
  }
}
```

## Response Model

The generated answer typically includes:

```json
{
  "answer": "The generated answer text...",
  "source_documents": [
    {
      "id": "doc-id",
      "title": "Document Title",
      "content_snippet": "Relevant content snippet...",
      "url": "optional-url"
    }
  ],
  "metadata": {
    "confidence": 0.92,
    "model": "model-name",
    "tokens_used": 250,
    "generation_time": 1.25
  }
}
```

## Provided Implementations

### Demo Generator (`demo.py`)

A simple demo generator for development and testing. This provider generates simple template-based answers without requiring a real LLM.

## Creating a Custom Generation Provider

To create a custom generation provider:

1. Create a new Python file in this directory (e.g., `azure_openai.py`)
2. Import `BaseGeneratorProvider` from `base.py`
3. Create a class that inherits from `BaseGeneratorProvider`
4. Implement all required methods
5. Add a factory function to return an instance of your provider
6. Update `providers/factory.py` to use your provider

### Example: Azure OpenAI Provider

```python
from typing import Any, Dict, List, Optional
import os
import time
import asyncio
import openai

from providers.generation.base import BaseGeneratorProvider

class AzureOpenAIProvider(BaseGeneratorProvider):
    def __init__(self):
        """Initialize the Azure OpenAI provider."""
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.api_endpoint = os.getenv("OPENAI_API_ENDPOINT")
        self.deployment_name = os.getenv("OPENAI_DEPLOYMENT_NAME", "gpt-35-turbo")
        self.api_version = os.getenv("OPENAI_API_VERSION", "2023-05-15")
        
        # Initialize OpenAI client
        openai.api_type = "azure"
        openai.api_key = self.api_key
        openai.api_base = self.api_endpoint
        openai.api_version = self.api_version
    
    def get_name(self) -> str:
        """Return the name of this generator."""
        return "Azure OpenAI"
    
    def get_description(self) -> str:
        """Return a description of this generator."""
        return "Generates answers using Azure OpenAI"
    
    def get_id(self) -> str:
        """Return a unique identifier for this generator."""
        return "azure-openai"
    
    async def generate_answer(self, question: str, documents: List[Dict[str, Any]], template: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate an answer using Azure OpenAI."""
        start_time = time.time()
        
        # Prepare context from documents
        context = ""
        for doc in documents:
            context += f"Document: {doc['title']}\n"
            context += f"Content: {doc['content']}\n\n"
        
        # Prepare prompt
        prompt_template = template.get("prompt", "Based on the following documents, please answer the question: {question}") if template else "Based on the following documents, please answer the question: {question}"
        prompt = prompt_template.replace("{question}", question)
        
        # Full prompt with context
        full_prompt = f"Context:\n{context}\n\n{prompt}"
        
        # Generate answer
        try:
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                engine=self.deployment_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided documents."},
                    {"role": "user", "content": full_prompt}
                ],
                temperature=0.7,
                max_tokens=800,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0,
                stop=None
            )
            
            answer = response.choices[0].message.content.strip()
            tokens_used = response.usage.total_tokens
            
            # Prepare source documents
            source_documents = []
            for doc in documents:
                source_documents.append({
                    "id": doc.get("id", ""),
                    "title": doc.get("title", ""),
                    "content_snippet": doc.get("content", "")[:150] + "...",
                    "url": doc.get("url", "")
                })
            
            # Calculate generation time
            generation_time = time.time() - start_time
            
            return {
                "answer": answer,
                "source_documents": source_documents,
                "metadata": {
                    "model": self.deployment_name,
                    "tokens_used": tokens_used,
                    "generation_time": generation_time
                }
            }
        except Exception as e:
            error_message = str(e)
            print(f"Error generating answer: {error_message}")
            return {
                "answer": f"Error generating answer: {error_message}",
                "source_documents": [],
                "metadata": {
                    "error": error_message,
                    "model": self.deployment_name
                }
            }

def get_provider() -> BaseGeneratorProvider:
    """Get an Azure OpenAI provider instance."""
    return AzureOpenAIProvider()
```

Then update `providers/factory.py`:

```python
def get_generator() -> Any:
    """Get a generator provider instance."""
    generator_provider = os.getenv("GENERATION_PROVIDER", "demo")
    
    if generator_provider == "demo":
        from providers.generation.demo import get_provider as get_demo_provider
        return get_demo_provider()
    elif generator_provider == "azure-openai":
        from providers.generation.azure_openai import get_provider as get_azure_openai_provider
        return get_azure_openai_provider()
    else:
        raise ValueError(f"Unknown generator provider: {generator_provider}")
```

## Generation Templates

Generation providers can use templates to customize the generation process. Templates typically include:

- **Prompt**: The prompt template with placeholders for variables
- **Parameters**: Additional parameters for generation (temperature, max tokens, etc.)
- **System Message**: Instructions for the LLM
- **Examples**: Few-shot learning examples

## Performance Considerations

When implementing a custom generation provider, consider:

1. **Caching**: Cache responses for common questions
2. **Async Processing**: Use asynchronous processing for better performance
3. **Timeout Handling**: Implement timeouts for generation requests
4. **Batching**: Batch requests when possible
5. **Error Handling**: Implement robust error handling and fallbacks

## Quality Considerations

To ensure high-quality generated answers:

1. **Prompt Engineering**: Craft effective prompts for accurate answers
2. **Context Window Management**: Ensure relevant context fits within model limits
3. **Source Attribution**: Include source documents in responses
4. **Filtering and Moderation**: Filter inappropriate or irrelevant content
5. **Evaluation Metrics**: Implement metrics to evaluate answer quality
