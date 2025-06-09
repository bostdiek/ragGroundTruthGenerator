# Backend - AI Ground Truth Generator

> 🚀 **FastAPI Backend** - Extensible API for ground truth data generation with pluggable providers

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Working with UV](#working-with-uv)
- [API Overview](#api-overview)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Extension Guide](#extension-guide)
- [Testing](#testing)
- [Development](#development)
- [Documentation](#documentation)

## 🎯 Overview

The backend is a **FastAPI template** designed with extensibility at its core. It demonstrates the **provider pattern** to show development teams how to implement swappable components for:

- 🗄️ **Database storage** (template uses in-memory, replace with PostgreSQL, MongoDB, etc.)
- 🔍 **Document retrieval** (template includes demo retriever, replace with Azure Search, Elasticsearch, etc.)
- 🤖 **AI answer generation** (template has demo responses, replace with OpenAI, Azure OpenAI, local models, etc.)
- 🔐 **Authentication** (template uses simple auth, replace with Azure AD, OAuth, custom systems, etc.)

### Template Status

- ✅ **Working Example** - All endpoints functional with demo implementations
- ✅ **Provider Pattern** - Clear extension points for all major components
- ✅ **Type Safety** - Full type hints demonstrating Python best practices
- ✅ **Documentation** - Auto-generated OpenAPI/Swagger docs
- 🎯 **Ready for Customization** - Demo implementations designed to be replaced

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** - Required for modern type hints and async features
- **[uv](https://docs.astral.sh/uv/)** - Fast Python package manager (replaces pip + virtualenv)

### Installation

If you don't have `uv` installed:

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or via pip
pip install uv
```

### Local Development

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies with uv:**

   ```bash
   # Creates virtual environment and installs all dependencies
   uv sync
   
   # Or install from scratch
   uv venv
   uv pip install -e .
   ```

3. **Set up environment configuration:**

   ```bash
   cp sample.env .env
   # Edit .env with your configuration values
   ```

4. **Run the development server:**

   ```bash
   # Run with uv (recommended)
   uv run uvicorn app:app --reload --host 0.0.0.0 --port 8000
   
   # Or activate environment first
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Explore the API:**

   - **API:** <http://localhost:8000>
   - **Interactive Docs:** <http://localhost:8000/docs>
   - **Alternative Docs:** <http://localhost:8000/redoc>
   - **Health Check:** <http://localhost:8000/health>

### Docker Development (Alternative)

```bash
# From project root
docker-compose up backend
```

## 📦 Working with UV

UV is a fast Python package manager that replaces pip and virtualenv. Here are the key commands:

### Package Management

```bash
# Add a new package
uv add package-name

# Add development dependency
uv add --dev package-name

# Add package with version constraint
uv add "fastapi>=0.100.0"

# Remove package
uv remove package-name

# Update all packages
uv sync

# Update specific package
uv add package-name --upgrade
```

### Environment Management

```bash
# Create virtual environment
uv venv

# Activate environment
source .venv/bin/activate  # macOS/Linux
.venv\Scripts\activate     # Windows

# Run commands in environment without activation
uv run python app.py
uv run pytest
uv run uvicorn app:app --reload

# Show package info
uv tree
uv list
```

### Project Configuration

The `pyproject.toml` file defines:

- **Dependencies** - Production packages
- **Dev Dependencies** - Development-only packages (testing, linting)
- **Tool Configuration** - Ruff (linting), pytest settings
- **Project Metadata** - Name, version, description

```toml
[project]
name = "backend"
dependencies = ["fastapi[standard]", "uvicorn", ...]

[dependency-groups]
dev = ["pytest", "ruff", ...]
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
- **Detailed API Reference:** [../docs/backendAPIs.md](../docs/backendAPIs.md)

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

Each provider type has its own configuration requirements. See the detailed [Extension Guide](../docs/extensions.md) for complete implementation examples.

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

For detailed extension examples, see the [Extension Guide](../docs/extensions.md) and [API Reference](../docs/backendAPIs.md).

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

# Add with version constraints
uv add "package-name>=1.0.0,<2.0.0"
```

### Development Workflow

```bash
# Install project in development mode
uv sync

# Run application
uv run uvicorn app:app --reload

# Run tests
uv run pytest

# Run linting
uv run ruff check .
uv run ruff format .

# Install pre-commit hooks
uv run pre-commit install
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

## 📚 Documentation

### Core Documentation

- 📖 **[Backend Architecture](../docs/backendArchitecture.md)** - Detailed system design and components
- 🔗 **[API Reference](../docs/backendAPIs.md)** - Complete endpoint documentation
- 🔧 **[Extension Guide](../docs/extensions.md)** - How to add custom providers
- 🚀 **[Interactive API Docs](http://localhost:8000/docs)** - Live API exploration (when running)

### Quick References

- **Environment Variables:** See `sample.env` for all configuration options
- **Provider Pattern:** Check `providers/factory.py` for extension points
- **Testing:** Run `uv run pytest` for comprehensive test suite
- **Code Quality:** Configured with `ruff` for linting and formatting

## 📚 Additional Resources

- **[Backend Architecture](../docs/backendArchitecture.md)** - Detailed system design and components
- **[API Reference](../docs/backendAPIs.md)** - Complete endpoint documentation
- **[Extension Guide](../docs/extensions.md)** - How to add custom providers

