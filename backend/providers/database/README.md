# Database Providers

This directory contains database providers for the AI Ground Truth Generator. Database providers are responsible for storing and retrieving data, specifically collections and QA pairs.

## Provider Interface

All database providers must implement the `BaseDatabase` interface defined in `base.py`. This interface includes methods for:

- Managing collections (create, read, update, delete)
- Managing QA pairs (create, read, update, delete)

## Data Models

### Collection

Collections represent a group of related QA pairs. A collection typically includes:

```json
{
  "id": "unique-id",
  "name": "Collection Name",
  "description": "Collection description",
  "type": "content-type",
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "qa_pair_count": 0,
  "metadata": {}
}
```

### QA Pair

QA pairs represent individual question-answer pairs within a collection. A QA pair typically includes:

```json
{
  "id": "unique-id",
  "collection_id": "parent-collection-id",
  "question": "The question text",
  "answer": "The answer text",
  "documents": [
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
  ],
  "status": "ready_for_review|approved|revision_requested|rejected",
  "metadata": {},
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "created_by": "user-id"
}
```

## Provided Implementations

### Memory Database (`memory.py`)

A simple in-memory database implementation for development and testing. This provider stores data in memory and is reset when the application restarts.

## Creating a Custom Database Provider

To create a custom database provider:

1. Create a new Python file in this directory (e.g., `mongodb.py`)
2. Import `BaseDatabase` from `base.py`
3. Create a class that inherits from `BaseDatabase`
4. Implement all required methods
5. Add a factory function to return an instance of your provider
6. Update `providers/factory.py` to use your provider

### Example: MongoDB Provider

```python
from typing import Any, Dict, List, Optional
from pymongo import MongoClient

from providers.database.base import BaseDatabase

class MongoDBDatabase(BaseDatabase):
    def __init__(self, collection_name: str):
        """Initialize the MongoDB database."""
        connection_string = os.getenv("MONGODB_CONNECTION_STRING")
        self.client = MongoClient(connection_string)
        self.db = self.client.get_database("ground_truth_generator")
        self.collection = self.db[collection_name]
    
    async def get_collection(self, collection_id: str) -> Dict[str, Any]:
        """Get a collection by ID."""
        collection = self.collection.find_one({"id": collection_id})
        if not collection:
            raise ValueError(f"Collection {collection_id} not found")
        return collection
    
    # Implement other required methods...

def get_mongodb_database(collection_name: str) -> BaseDatabase:
    """Get a MongoDB database instance."""
    return MongoDBDatabase(collection_name)
```

Then update `providers/factory.py`:

```python
def get_database(collection_name: str) -> Any:
    """Get a database instance based on environment configuration."""
    database_provider = os.getenv("DATABASE_PROVIDER", "memory")
    
    if database_provider == "memory":
        from providers.database.memory import get_memory_database
        return get_memory_database(collection_name)
    elif database_provider == "mongodb":
        from providers.database.mongodb import get_mongodb_database
        return get_mongodb_database(collection_name)
    else:
        raise ValueError(f"Unsupported DATABASE_PROVIDER: {database_provider}")
```

## Performance Considerations

When implementing a custom database provider, consider:

1. **Indexing**: Ensure proper indexes are created for efficient queries
2. **Caching**: Consider implementing caching for frequently accessed data
3. **Transactions**: Use transactions for operations that modify multiple documents
4. **Connection Pooling**: Implement connection pooling for better performance
5. **Error Handling**: Implement robust error handling and retry logic

## Security Considerations

When implementing a custom database provider, consider:

1. **Authentication**: Use strong authentication for database access
2. **Authorization**: Implement proper access controls at the database level
3. **Encryption**: Encrypt sensitive data at rest
4. **Input Validation**: Validate all inputs to prevent injection attacks
5. **Auditing**: Implement auditing for sensitive operations
