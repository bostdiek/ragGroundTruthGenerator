# Extension Guide

This guide shows you how to extend each part of the AI Ground Truth Generator platform. You’ll see the minimal base interfaces and learn how to register your own implementations for:

- **Authentication Providers**
- **Data Source Providers**
- **Generation Providers**
- **Database Providers**

All providers are discovered and wired up through a single factory (`backend/providers/factory.py`). Use environment variables to switch between the built-in *demo* implementations and your custom code.

---

## Table of Contents

- [Provider Interfaces](#provider-interfaces)
- [Factory Configuration](#factory-configuration)
- [Extension Examples](#extension-examples)
- [Best Practices](#best-practices)

---

## Provider Interfaces

Each provider type defines a minimal abstract base class. Your team brings its own implementations by inheriting from these classes and registering them in the factory.

### 1. Authentication

File: `backend/providers/auth/base.py`

```python
from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAuthProvider(ABC):
    """Abstract interface for authentication providers."""

    @abstractmethod
    async def authenticate(self, username: str, password: str) -> Dict[str, Any]:
        """Log in a user and return a token payload."""
        pass

    @abstractmethod
    async def register(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new user."""
        pass

    @abstractmethod
    async def validate_token(self, token: str) -> Dict[str, Any]:
        """Verify a token and return its claims."""
        pass
``` 

### 2. Data Sources

File: `backend/providers/data_sources/base.py`

```python
from abc import ABC, abstractmethod
from typing import Any, Dict, List

class BaseDataSourceProvider(ABC):
    """Abstract interface for data source providers."""

    @abstractmethod
    def get_id(self) -> str:
        """Unique provider identifier."""
        pass

    @abstractmethod
    def get_name(self) -> str:
        """User-friendly name displayed in the UI."""
        pass

    @abstractmethod
    def get_description(self) -> str:
        """Short description for end users."""
        pass

    @abstractmethod
    async def retrieve_documents(
        self,
        query: str,
        filters: Dict[str, Any] | None = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Return documents matching the query."""
        pass
```

### 3. Generation

File: `backend/providers/generation/base.py`

```python
from abc import ABC, abstractmethod
from typing import Any, Dict, List

class BaseGenerator(ABC):
    """Abstract interface for generation providers."""

    @abstractmethod
    async def generate_answer(
        self,
        question: str,
        documents: List[Dict[str, Any]],
        custom_rules: List[str] | None = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Produce an answer and metadata."""
        pass
```  

### 4. Database

File: `backend/providers/database/base.py`

```python
from abc import ABC, abstractmethod
from typing import Any, Dict, List

class BaseDatabase(ABC):
    """Abstract interface for database providers."""

    @abstractmethod
    async def create_collection(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new collection."""
        pass

    @abstractmethod
    async def list_collections(self, filters: Dict[str, Any] | None = None) -> List[Dict[str, Any]]:
        """List existing collections."""
        pass

    # ...existing methods for get_collection, update_collection, delete_collection,
    # get_qa_pair, list_qa_pairs, add_qa_pair, update_qa_pair, delete_qa_pair...
```  

---

## Factory Configuration

All providers are wired up in a single factory file. Switch implementations by setting the environment variables (`AUTH_PROVIDER`, `ENABLED_DATA_SOURCES`, `GENERATION_PROVIDER`, `DATABASE_PROVIDER`).

File: `backend/providers/factory.py`

```python
# Simplified example:

def get_auth_provider():
    provider = os.getenv('AUTH_PROVIDER', 'simple')
    if provider == 'simple':
        from providers.auth.simple_auth import get_provider
        return get_provider()
    elif provider == 'azure-ad':
        from providers.auth.azure_ad_provider import AzureADProvider
        return AzureADProvider()
    else:
        raise ValueError(f"Unknown AUTH_PROVIDER: {provider}")

# get_data_source_provider, get_generator, get_database follow the same pattern.
```  

---

## Extension Examples

Below are minimal conceptual examples—you’ll need to adapt imports, error handling, and configuration for your own environment.

### Auth Provider Extension Example

1. Create `backend/providers/auth/my_auth_provider.py`
2. Inherit from `BaseAuthProvider` and implement `authenticate`, `register`, `validate_token`
3. Update `factory.py` to include:
   ```python
   elif provider == 'my-auth':
       from providers.auth.my_auth_provider import MyAuthProvider
       return MyAuthProvider()
   ```
4. Set `AUTH_PROVIDER=my-auth` in `.env`

### Data Source Extension Example

1. Create `backend/providers/data_sources/my_source.py`
2. Inherit from `BaseDataSourceProvider`
3. Implement `get_id`, `get_name`, `get_description`, `retrieve_documents`
4. Set `ENABLED_DATA_SOURCES=memory,my_source`

### Generation Extension Example

1. Create `backend/providers/generation/my_generator.py`
2. Inherit from `BaseGenerator` and implement `generate_answer`
3. Update factory:
   ```python
   elif generation_provider == 'my-gen':
       from providers.generation.my_generator import MyGenerator
       return MyGenerator()
   ```
4. Set `GENERATION_PROVIDER=my-gen`

### Database Extension Example

1. Create `backend/providers/database/my_database.py`
2. Inherit from `BaseDatabase` and implement all abstract methods
3. Update factory:
   ```python
   elif database_provider == 'my-db':
       from providers.database.my_database import MyDatabase
       return MyDatabase(collection_name)
   ```
4. Set `DATABASE_PROVIDER=my-db`

---

## Best Practices

- Write **unit tests** for each provider implementation.
- Validate configuration in `__init__` and fail fast.
- Clean up resources in async context managers (`__aenter__`/`__aexit__`).
- Use **logging** to trace operations and errors.
- Keep provider logic focused—don’t mix data access, business rules, and transformation.
- Document any custom rules or prompts for generation providers.

---

> ✨ *With this guide, your team can swap in Azure AD, PostgreSQL, Azure AISearch, custom AI prompts, or any other service—while keeping the core pipeline the same.*
