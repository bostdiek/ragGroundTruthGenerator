# Backend - AI Ground Truth Generator

> 🚀 **FastAPI Backend** - Extensible API for ground truth data generation with pluggable providers

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [API Overview](#api-overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Extension Guide](#extension-guide)
- [Testing](#testing)
- [Development](#development)

## 🎯 Overview

The backend is a FastAPI application designed with extensibility at its core. It uses a **provider pattern** to allow easy swapping of implementations for:

- 🗄️ **Database storage** (currently in-memory, extend to PostgreSQL, MongoDB, etc.)
- 🔍 **Document retrieval** (extend to Azure Search, Elasticsearch, file systems, etc.)
- 🤖 **AI answer generation** (extend to OpenAI, Azure OpenAI, local models, etc.)
- 🔐 **Authentication** (extend to Azure AD, OAuth, custom systems, etc.)

### Current State

- ✅ **Functional APIs** - All endpoints working with demo implementations
- ✅ **Provider Pattern** - Easy extension points for all major components
- ✅ **Type Safety** - Full TypeScript-style type hints in Python
- ✅ **Documentation** - Auto-generated OpenAPI/Swagger docs
- ⚠️ **Demo Implementations** - Ready for production replacements

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- [uv](https://docs.astral.sh/uv/) package manager

### Local Development

1. **Install dependencies:**

   ```bash
   cd backend
   uv sync
   ```

2. **Set up environment:**

   ```bash
   cp sample.env .env
   # Edit .env with your configuration
   ```

3. **Run the server:**

   ```bash
   uv run uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the API:**

   - **API:** <http://localhost:8000>
   - **Docs:** <http://localhost:8000/docs>
   - **ReDoc:** <http://localhost:8000/redoc>

### Docker Development

```bash
# From project root
docker-compose up backend
```

## 📡 API Overview

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/collections` | GET, POST | List and create collections |
| `/collections/{id}` | GET, PUT, DELETE | Manage specific collections |
| `/collections/{id}/qa-pairs` | GET, POST | Manage Q&A pairs in collection |
| `/retrieval/sources` | GET | List available document sources |
| `/retrieval/search` | POST | Search documents across sources |
| `/generation/generate` | POST | Generate answers from documents |
| `/auth/login` | POST | User authentication |

### API Documentation

- **Interactive Docs:** <http://localhost:8000/docs>
- **Detailed API Reference:** [docs/backend-api.md](../docs/backend-api.md)

## 🏗️ Architecture

```text
backend/
├── app.py                    # FastAPI application setup
├── routers/                  # API endpoint definitions
│   ├── auth.py              # Authentication endpoints
│   ├── collections.py       # Collection & QA management
│   ├── generation.py        # Answer generation
│   └── retrieval.py         # Document search
├── providers/               # Extensible provider implementations
│   ├── factory.py          # Provider factory (main extension point)
│   ├── database/           # Database providers
│   ├── auth/               # Authentication providers
│   ├── data_sources/       # Document retrieval providers
│   └── generation/         # AI generation providers
└── tests/                  # Test suite
```

### Provider Pattern

The core extensibility comes from the **provider pattern** implemented in `providers/factory.py`:

```python
# Environment-driven provider selection
DATABASE_PROVIDER = "memory"        # or "postgresql", "mongodb"
GENERATION_PROVIDER = "demo"        # or "azure-openai", "openai"
RETRIEVAL_PROVIDER = "template"     # or "azure-search", "elasticsearch"
AUTH_PROVIDER = "simple"            # or "azure-ad", "oauth"
```

## ⚙️ Configuration

### Environment Variables

```bash
# Core Application
DATABASE_PROVIDER=memory
GENERATION_PROVIDER=demo
RETRIEVAL_PROVIDER=template
AUTH_PROVIDER=simple

# Data Sources (comma-separated)
ENABLED_DATA_SOURCES=memory,template

# External Services (when using real providers)
AZURE_OPENAI_ENDPOINT=your-endpoint
AZURE_OPENAI_API_KEY=your-key
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

### Provider Configuration

Each provider type has its own configuration requirements. See [Extension Guide](#extension-guide) for details.

## 🔧 Extension Guide

### Adding a New Database Provider

1. **Create the provider class:**

   ```python
   # providers/database/postgresql.py
   from providers.database.base import DatabaseProvider
   
   class PostgreSQLProvider(DatabaseProvider):
       async def get_collections(self) -> List[Collection]:
           # Your implementation
           pass
   ```

2. **Register in factory:**

   ```python
   # providers/factory.py
   def get_database_provider():
       if DATABASE_PROVIDER == "postgresql":
           from providers.database.postgresql import PostgreSQLProvider
           return PostgreSQLProvider()
   ```

3. **Configure environment:**

   ```bash
   DATABASE_PROVIDER=postgresql
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```

### Adding a New Document Source

1. **Implement the interface:**

   ```python
   # providers/data_sources/azure_search.py
   from providers.base_data_source_provider import BaseDataSourceProvider
   
   class AzureSearchProvider(BaseDataSourceProvider):
       def get_id(self) -> str:
           return "azure-search"
       
       async def retrieve_documents(self, query: str, max_results: int = 10):
           # Your implementation
           pass
   ```

2. **Register in factory:**

   ```python
   # providers/factory.py
   def get_data_source_provider(provider_id: str):
       if provider_id == "azure-search":
           from providers.data_sources.azure_search import AzureSearchProvider
           return AzureSearchProvider()
   ```

3. **Enable in configuration:**

   ```bash
   ENABLED_DATA_SOURCES=memory,azure-search
   ```

### Adding a New AI Generator

1. **Create the generator:**

   ```python
   # providers/generation/azure_openai.py
   class AzureOpenAIGenerator:
       async def generate_answer(self, question: str, documents: List[Document], **kwargs):
           # Your implementation using Azure OpenAI
           pass
   ```

2. **Register in factory:**

   ```python
   # providers/factory.py
   def get_generator():
       if GENERATION_PROVIDER == "azure-openai":
           from providers.generation.azure_openai import AzureOpenAIGenerator
           return AzureOpenAIGenerator()
   ```

For detailed extension examples, see [docs/backend-api.md](../docs/backend-api.md).

## 🧪 Testing

### Run Tests

```bash
# Unit tests
uv run pytest tests/unit/

# Integration tests
uv run pytest tests/integration/

# All tests with coverage
uv run pytest --cov=. --cov-report=html
```

### Test Structure

```text
tests/
├── unit/                   # Unit tests for individual components
│   ├── test_providers.py   # Provider implementations
│   ├── test_routers.py     # API endpoints
│   └── test_database.py    # Database operations
├── integration/            # End-to-end API tests
└── conftest.py            # Shared test configuration
```

## 🛠️ Development

### Code Standards

- **Type Hints:** Required for all functions and methods
- **Docstrings:** Google-style docstrings for all public functions
- **Formatting:** Managed by `ruff` (configured in `pyproject.toml`)
- **Linting:** Pre-commit hooks ensure code quality

### Adding Dependencies

```bash
# Add a new package
uv add package-name

# Add development dependency
uv add --dev package-name

# Update all dependencies
uv sync
```

### Project Structure Best Practices

- **Routers:** Keep thin, delegate to service layer
- **Providers:** Implement clean interfaces, handle errors gracefully
- **Configuration:** Use environment variables, provide sensible defaults
- **Testing:** High coverage, especially for provider interfaces

### Debugging

```bash
# Run with debug logging
PYTHONPATH=. uv run uvicorn app:app --reload --log-level debug

# Interactive debugging
uv run python -m pdb app.py
```

## 📚 Additional Resources

- **[API Reference](../docs/backend-api.md)** - Complete API documentation
- **[Extension Examples](../docs/backend-api.md#extension-examples)** - Real-world provider implementations
- **[Deployment Guide](../docs/deployment.md)** - Production deployment strategies
- **[Contributing Guidelines](../CONTRIBUTING.md)** - Development workflow and standards

## 🤝 Contributing

See the main [Contributing Guidelines](../README.md#contributing) for the overall project contribution process.

### Backend-Specific Guidelines

1. **Provider Development:** All new providers should include unit tests and documentation
2. **API Changes:** Update both OpenAPI docs and the manual API reference
3. **Breaking Changes:** Ensure backward compatibility or provide migration guides
4. **Performance:** Consider async/await patterns for I/O operations

---

**Need help?** Check the [docs directory](../docs/) for detailed guides or open an issue for support.
