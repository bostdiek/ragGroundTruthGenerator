# Retrieval Providers

This directory contains retrieval providers for the AI Ground Truth Generator. Retrieval providers are responsible for managing document templates and retrieval methods.

## Provider Interface

All retrieval providers must implement the `BaseRetrievalProvider` interface defined in `base.py`. This interface includes methods for:

- Getting templates for document retrieval and answer generation
- Managing custom templates
- Providing document context for answer generation

## Template Model

Templates in the retrieval system typically include:

```json
{
  "id": "template-id",
  "name": "Template Name",
  "description": "Template description",
  "prompt": "Based on the following documents, please answer the question: {question}",
  "fields": ["question", "additional_context"],
  "metadata": {}
}
```

## Provided Implementations

### Template Retriever (`template.py`)

A simple template provider for development and testing. This provider manages document retrieval templates and customization.

## Creating a Custom Retrieval Provider

To create a custom retrieval provider:

1. Create a new Python file in this directory (e.g., `custom_template.py`)
2. Import `BaseRetrievalProvider` from `base.py`
3. Create a class that inherits from `BaseRetrievalProvider`
4. Implement all required methods
5. Add a factory function to return an instance of your provider
6. Update `providers/factory.py` to use your provider

### Example: Custom Template Provider

```python
from typing import Any, Dict, List, Optional
import os
import json

from providers.retrieval.base import BaseRetrievalProvider

class CustomTemplateProvider(BaseRetrievalProvider):
    def __init__(self):
        """Initialize the custom template provider."""
        self.templates_file = os.getenv("TEMPLATES_FILE", "data/templates.json")
        self.templates = self._load_templates()
    
    def _load_templates(self) -> List[Dict[str, Any]]:
        """Load templates from file or return default templates."""
        try:
            if os.path.exists(self.templates_file):
                with open(self.templates_file, "r") as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading templates: {e}")
        
        # Default templates if file doesn't exist or has an error
        return [
            {
                "id": "default",
                "name": "Default Template",
                "description": "A default template for answer generation",
                "prompt": "Based on the following documents, please answer the question: {question}",
                "fields": ["question"]
            },
            {
                "id": "detailed",
                "name": "Detailed Explanation",
                "description": "A template for detailed explanations",
                "prompt": "Based on the following documents, provide a detailed explanation for: {question}\n\nInclude specific examples and references.",
                "fields": ["question"]
            },
            {
                "id": "steps",
                "name": "Step-by-Step Guide",
                "description": "A template for procedural instructions",
                "prompt": "Based on the following documents, provide step-by-step instructions for: {question}",
                "fields": ["question"]
            }
        ]
    
    def _save_templates(self) -> None:
        """Save templates to file."""
        try:
            os.makedirs(os.path.dirname(self.templates_file), exist_ok=True)
            with open(self.templates_file, "w") as f:
                json.dump(self.templates, f, indent=2)
        except Exception as e:
            print(f"Error saving templates: {e}")
    
    async def get_templates(self) -> List[Dict[str, Any]]:
        """Get all available templates."""
        return self.templates
    
    async def get_template(self, template_id: str) -> Dict[str, Any]:
        """Get a specific template by ID."""
        for template in self.templates:
            if template["id"] == template_id:
                return template
        raise ValueError(f"Template not found: {template_id}")
    
    async def create_template(self, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new template."""
        # Validate template data
        required_fields = ["name", "description", "prompt", "fields"]
        for field in required_fields:
            if field not in template_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Generate ID if not provided
        if "id" not in template_data:
            import uuid
            template_data["id"] = str(uuid.uuid4())
        
        # Ensure unique ID
        for template in self.templates:
            if template["id"] == template_data["id"]:
                raise ValueError(f"Template with ID {template_data['id']} already exists")
        
        # Add template
        self.templates.append(template_data)
        self._save_templates()
        
        return template_data
    
    async def update_template(self, template_id: str, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing template."""
        # Find template
        for i, template in enumerate(self.templates):
            if template["id"] == template_id:
                # Update fields
                for key, value in template_data.items():
                    if key != "id":  # Don't change the ID
                        template[key] = value
                
                self._save_templates()
                return template
        
        raise ValueError(f"Template not found: {template_id}")
    
    async def delete_template(self, template_id: str) -> None:
        """Delete a template."""
        # Find template
        for i, template in enumerate(self.templates):
            if template["id"] == template_id:
                # Remove template
                self.templates.pop(i)
                self._save_templates()
                return
        
        raise ValueError(f"Template not found: {template_id}")

def get_provider() -> BaseRetrievalProvider:
    """Get a custom template provider instance."""
    return CustomTemplateProvider()
```

Then update `providers/factory.py`:

```python
def get_retrieval_provider() -> Any:
    """Get a retrieval provider instance."""
    retrieval_provider = os.getenv("RETRIEVAL_PROVIDER", "template")
    
    if retrieval_provider == "template":
        from providers.retrieval.template import get_provider as get_template_provider
        return get_template_provider()
    elif retrieval_provider == "custom-template":
        from providers.retrieval.custom_template import get_provider as get_custom_template_provider
        return get_custom_template_provider()
    else:
        raise ValueError(f"Unknown retrieval provider: {retrieval_provider}")
```

## Prompt Engineering

Creating effective templates for RAG systems requires careful prompt engineering:

1. **Clear Instructions**: Include clear instructions for the LLM
2. **Context Management**: Ensure the template handles document context effectively
3. **Task Guidance**: Guide the LLM toward the desired output format
4. **Error Handling**: Include guidance for handling cases where information is not available
5. **Variable Substitution**: Support dynamic variables in templates

## Performance Considerations

When implementing a custom retrieval provider, consider:

1. **Caching**: Cache frequently used templates
2. **Validation**: Validate template syntax and structure
3. **Versioning**: Support template versioning for tracking changes
4. **Customization**: Allow user-specific template customization
5. **Analytics**: Track template performance metrics

## Integration with Data Sources

Retrieval providers often work closely with data source providers:

1. **Context Building**: Create effective document context for the LLM
2. **Source Attribution**: Preserve source information for attribution
3. **Content Filtering**: Filter and process document content
4. **Query Reformulation**: Improve search queries based on user questions
5. **Hybrid Retrieval**: Combine different retrieval strategies
