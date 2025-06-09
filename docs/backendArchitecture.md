# Backend Architecture

The AI Ground Truth Generator backend is built using **FastAPI** and follows a modular, extensible architecture based on the **Provider Pattern**. This design allows teams to easily swap out implementations for different components without changing the core application logic.

---

## Table of Contents

- [Overview](#overview)
- [Architecture Components](#architecture-components)
- [Provider Pattern](#provider-pattern)
- [Data Flow](#data-flow)
- [Key Design Principles](#key-design-principles)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)

---

## Overview

The backend serves as a flexible foundation for generating ground truth data for AI training. It provides APIs for:

- **Authentication** - User management and token-based auth
- **Collections** - Organizing QA pairs into collections
- **Document Retrieval** - Searching and retrieving documents from various data sources
- **Answer Generation** - Generating answers using AI models based on retrieved documents

The architecture is designed to be **template-ready**, meaning teams can quickly adapt it to their specific use cases by implementing custom providers.

---

## Architecture Components

### 1. FastAPI Application (`app.py`)

The main application module that:

- Sets up the FastAPI app with CORS middleware
- Loads environment variables
- Includes all routers with their respective URL prefixes
- Provides health check endpoint
- Configures logging and response middleware

### 2. Routers (`routers/`)

The API layer is organized into four main routers:

- **`auth.py`** - Authentication endpoints (`/auth/*`)
- **`collections.py`** - Collection and QA pair management (`/collections/*`)
- **`retrieval.py`** - Document search and data source management (`/retrieval/*`)
- **`generation.py`** - Answer generation (`/generation/*`)

### 3. Provider System (`providers/`)

The core extensibility mechanism consisting of:

- **Factory (`factory.py`)** - Central factory for instantiating providers based on environment config
- **Base Interfaces** - Abstract base classes defining provider contracts
- **Concrete Implementations** - Demo implementations for development

### 4. Generation Manager

Orchestrates the answer generation workflow by:

- Accepting generation requests with questions, documents, and custom rules
- Delegating to the configured generator provider
- Formatting responses with token usage and metadata

---

## Provider Pattern

The backend uses the Provider Pattern to achieve modularity and extensibility. Each provider type has:

### Base Interface

Defines the contract that all implementations must follow:

```python
class BaseAuthProvider(ABC):
    @abstractmethod
    async def authenticate(self, username: str, password: str) -> dict[str, Any]:
        pass
    # ... other methods
```

### Factory Registration

The factory (`providers/factory.py`) instantiates providers based on environment variables:

```python
def get_auth_provider() -> Any:
    auth_provider = os.getenv("AUTH_PROVIDER", "simple")
    if auth_provider == "simple":
        from providers.auth.simple_auth import get_provider
        return get_provider()
    # ... other providers
```

### Provider Types

1. **Authentication Providers** (`providers/auth/`)
   - Handle user authentication, registration, and token validation
   - Demo: Simple in-memory user store with JWT tokens

2. **Data Source Providers** (`providers/data_sources/`)
   - Retrieve documents from various sources (databases, APIs, files)
   - Demo: In-memory document store

3. **Generation Providers** (`providers/generation/`)
   - Generate answers using AI models
   - Demo: Static responses for development

4. **Database Providers** (`providers/database/`)
   - Store and retrieve collections and QA pairs
   - Demo: In-memory storage

---

## Data Flow

### 1. Authentication Flow

```text
User Login → Auth Router → Auth Provider → JWT Token → Authenticated Requests
```

### 2. Document Retrieval Flow

```text
Search Query → Retrieval Router → Data Source Provider(s) → Formatted Documents
```

### 3. Answer Generation Flow

```text
Question + Documents → Generation Router → Generation Manager → Generator Provider → Answer
```

### 4. Collection Management Flow

```text
CRUD Operations → Collections Router → Database Provider → Collections/QA Pairs Storage
```

---

## Key Design Principles

### 1. **Separation of Concerns**

- Routers handle HTTP concerns (request/response, validation)
- Providers handle business logic and external integrations
- Factory manages provider instantiation and configuration

### 2. **Interface Segregation**

- Each provider type has a focused, minimal interface
- Implementations only need to implement relevant methods
- Clear contracts between components

### 3. **Dependency Injection**

- Providers are injected via factory functions
- Easy to mock for testing
- Runtime configuration via environment variables

### 4. **Extensibility**

- Adding new providers requires minimal changes to existing code
- Factory pattern allows swapping implementations
- Base interfaces ensure compatibility

### 5. **Template Design**

- Demo implementations provide working examples
- Clear TODO comments indicate extension points
- Environment-driven configuration

---

## Environment Configuration

The backend uses environment variables to configure providers:

```bash
# Authentication
AUTH_PROVIDER=simple                 # simple, azure-ad, oauth

# Data Sources
ENABLED_DATA_SOURCES=memory          # memory, azure_search, database

# Generation
GENERATION_PROVIDER=demo             # demo, azure-openai, openai

# Database
DATABASE_PROVIDER=memory             # memory, mongodb, cosmosdb
```

---

## Project Structure

```txt
backend/
├── app.py                          # Main FastAPI application
├── routers/                        # API endpoints
│   ├── auth.py                     # Authentication endpoints
│   ├── collections.py              # Collection management
│   ├── generation.py               # Answer generation
│   └── retrieval.py                # Document retrieval
├── providers/                      # Provider system
│   ├── factory.py                  # Provider factory
│   ├── auth/                       # Authentication providers
│   │   ├── base.py                 # Base interface
│   │   └── simple_auth.py          # Demo implementation
│   ├── data_sources/               # Data source providers
│   │   ├── base.py                 # Base interface
│   │   └── memory.py               # Demo implementation
│   ├── generation/                 # Generation providers
│   │   ├── base.py                 # Base interface
│   │   ├── demo.py                 # Demo implementation
│   │   └── __init__.py             # Generation manager
│   └── database/                   # Database providers
│       ├── base.py                 # Base interface
│       └── memory.py               # Demo implementation
├── tests/                          # Unit tests
└── data/                           # Demo data files
```

This architecture provides a solid foundation for teams to build upon while maintaining flexibility for different deployment scenarios and integration requirements.
