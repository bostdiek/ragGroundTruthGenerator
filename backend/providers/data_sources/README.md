# Data Source Providers

This directory contains data source providers for the AI Ground Truth Generator. Data source providers are responsible for retrieving documents from various sources to be used as context for question answering.

## Provider Interface

All data source providers must implement the `BaseDataSourceProvider` interface defined in `base.py`. This interface includes methods for:

- Getting provider metadata (name, description, ID)
- Retrieving documents based on a search query
- Getting a specific document by ID

## Document Model

Documents retrieved by data source providers typically include:

```json
{
  "id": "doc-id",
  "title": "Document Title",
  "content": "Document content snippet",
  "source": {
    "id": "source-id",
    "name": "Source Name",
    "type": "source-type"
  },
  "url": "optional-url",
  "metadata": {}
}
```

## Provided Implementations

### Memory Data Source (`memory.py`)

A simple in-memory data source implementation for development and testing. This provider returns pre-defined documents based on keyword matching.

## Creating a Custom Data Source Provider

To create a custom data source provider:

1. Create a new Python file in this directory (e.g., `azure_search.py`)
2. Import `BaseDataSourceProvider` from `base.py`
3. Create a class that inherits from `BaseDataSourceProvider`
4. Implement all required methods
5. Add a factory function to return an instance of your provider
6. Update `providers/factory.py` to use your provider

### Example: Azure AI Search Provider

```python
from typing import Any, Dict, List, Optional
import os
import httpx

from providers.data_sources.base import BaseDataSourceProvider

class AzureAISearchProvider(BaseDataSourceProvider):
    def __init__(self):
        """Initialize the Azure AI Search provider."""
        self.endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
        self.key = os.getenv("AZURE_SEARCH_KEY")
        self.index_name = os.getenv("AZURE_SEARCH_INDEX")
        self.api_version = "2023-07-01-Preview"
        self.headers = {
            "Content-Type": "application/json",
            "api-key": self.key
        }
    
    def get_name(self) -> str:
        """Return the name of this data source."""
        return "Azure AI Search"
    
    def get_description(self) -> str:
        """Return a description of this data source."""
        return "Retrieves documents from Azure AI Search"
    
    def get_id(self) -> str:
        """Return a unique identifier for this data source."""
        return "azure-search"
    
    async def retrieve_documents(self, query: str, filters: Optional[Dict[str, Any]] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieve documents from Azure AI Search."""
        search_params = {
            "search": query,
            "top": limit,
            "queryType": "semantic",
            "semanticConfiguration": "default",
            "captions": "extractive",
            "answers": "extractive",
            "count": True
        }
        
        # Add filters if provided
        if filters:
            filter_string = " and ".join([f"{k} eq '{v}'" for k, v in filters.items()])
            search_params["filter"] = filter_string
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.endpoint}/indexes/{self.index_name}/docs/search",
                headers=self.headers,
                params={"api-version": self.api_version},
                json=search_params
            )
            
            if response.status_code != 200:
                raise Exception(f"Search failed: {response.text}")
            
            result = response.json()
            documents = []
            
            for value in result.get("value", []):
                documents.append({
                    "id": value.get("id", ""),
                    "title": value.get("title", ""),
                    "content": value.get("content", ""),
                    "source": {
                        "id": "azure-search",
                        "name": "Azure AI Search",
                        "type": "search"
                    },
                    "url": value.get("url", ""),
                    "metadata": {
                        "score": value.get("@search.score"),
                        "captions": value.get("@search.captions", []),
                        "answers": value.get("@search.answers", [])
                    }
                })
            
            return documents
    
    async def get_document(self, document_id: str) -> Dict[str, Any]:
        """Retrieve a specific document by ID."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.endpoint}/indexes/{self.index_name}/docs/{document_id}",
                headers=self.headers,
                params={"api-version": self.api_version}
            )
            
            if response.status_code != 200:
                raise Exception(f"Document retrieval failed: {response.text}")
            
            value = response.json()
            return {
                "id": value.get("id", ""),
                "title": value.get("title", ""),
                "content": value.get("content", ""),
                "source": {
                    "id": "azure-search",
                    "name": "Azure AI Search",
                    "type": "search"
                },
                "url": value.get("url", ""),
                "metadata": {}
            }

def get_provider() -> BaseDataSourceProvider:
    """Get an Azure AI Search provider instance."""
    return AzureAISearchProvider()
```

Then update `providers/factory.py`:

```python
def get_data_source_provider(provider_id: str) -> Any:
    """Get a data source provider instance by ID."""
    if provider_id == "memory":
        from providers.data_sources.memory import get_provider as get_memory_provider
        return get_memory_provider()
    elif provider_id == "azure-search":
        from providers.data_sources.azure_search import get_provider as get_azure_search_provider
        return get_azure_search_provider()
    else:
        raise ValueError(f"Unknown data source provider: {provider_id}")
```

## RAG (Retrieval-Augmented Generation) Considerations

When implementing a data source provider for RAG:

1. **Vector Search**: Consider implementing vector-based search for semantic matching
2. **Ranking**: Implement a ranking mechanism to prioritize more relevant documents
3. **Filtering**: Allow for metadata-based filtering to narrow down results
4. **Context Window Management**: Consider document length in relation to LLM context windows
5. **Hybrid Search**: Consider combining keyword and vector search for better results

## Performance Considerations

1. **Caching**: Implement caching for frequently accessed documents
2. **Pagination**: Support pagination for large result sets
3. **Batching**: Implement batching for bulk document retrieval
4. **Asynchronous Processing**: Use asynchronous processing for better performance

## Security Considerations

1. **Authentication**: Use strong authentication for data source access
2. **Authorization**: Implement proper access controls
3. **Data Privacy**: Ensure sensitive data is properly handled
4. **Logging**: Implement logging for audit purposes
