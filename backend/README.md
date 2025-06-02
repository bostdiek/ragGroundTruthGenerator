# AI Ground Truth Generator Backend

This is the backend component of the AI Ground Truth Generator project. It provides a simple, extensible FastAPI application that serves as a template for generating ground truth data for AI training.

## Overview

The backend is designed as a modular, provider-based API that can be easily extended to support different authentication methods, database systems, storage solutions, retrieval mechanisms, and generation engines.

## Getting Started

### Prerequisites

- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) - A fast Python package installer and resolver (recommended)

### Setting Up with uv (Recommended)

[uv](https://github.com/astral-sh/uv) is a fast, reliable Python package installer and virtual environment manager. It's significantly faster than pip and provides better dependency resolution.

1. **Install uv**:

   ```bash
   curl -sSf https://install.python-poetry.org | python3 -
   ```

2. **Create a virtual environment and install dependencies**:

   ```bash
   cd backend
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   uv pip install -e .
   ```

3. **Run the development server**:

   ```bash
   uv run fastapi dev
   ```

The server will start on [http://127.0.0.1:8000](http://127.0.0.1:8000) with API documentation available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### Alternative Setup (without uv)

If you prefer not to use uv, you can set up the project with standard Python tools:

1. **Create a virtual environment**:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

2. **Install dependencies**:

   ```bash
   pip install -e .
   ```

3. **Run the development server**:

   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

## Architecture

### Core Components

The backend follows a clean, modular architecture with the following main components:

1. **API Layer (FastAPI)**: Handles HTTP requests/responses and routing
2. **Routers**: Organize endpoints by functional domain
3. **Provider Pattern**: Enables swappable implementations for different services
4. **Models**: Define data structures using Pydantic

### Directory Structure

```plaintext
backend/
├── app.py                 # Main application entry point
├── routers/               # API route definitions
│   ├── auth.py            # Authentication endpoints
│   ├── collections.py     # Collection management endpoints
│   ├── generation.py      # Answer generation endpoints
│   └── retrieval.py       # Document retrieval endpoints
├── providers/             # Pluggable service implementations
│   ├── database.py        # Database provider factory
│   ├── factory.py         # General provider factory functions
│   ├── memory_db.py       # In-memory database implementation
│   ├── demo_generator.py  # Demo answer generator implementation
│   ├── simple_auth.py     # Simple authentication implementation
│   └── template_retriever.py  # Template retrieval implementation
└── data/                  # Local data storage
    └── storage/           # Local file storage directory
```

### Provider Pattern

The backend uses a provider pattern to make implementations swappable. Each core functionality is abstracted behind a provider interface:

1. **Authentication Providers**: Handle user authentication and authorization
   - Default: `simple` - Basic JWT token authentication

2. **Database Providers**: Store and retrieve structured data
   - Default: `memory` - In-memory database (resets on app restart)

3. **Storage Providers**: Handle file storage
   - Default: `local` - Local filesystem storage

4. **Retrieval Providers**: Search and retrieve documents
   - Default: `template` - Simple template-based document retrieval

5. **Generation Providers**: Generate answers from documents
   - Default: `template` - Simple template-based answer generation

## Configuration

Configuration is managed through environment variables, which can be set in the `.env` file:

1. Copy the sample environment file:

   ```bash
   cp sample.env .env
   ```

2. Edit the `.env` file to customize your configuration:

```plaintext
# Development Environment Variables
ENV=development
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:3000

# Authentication Provider Configuration
AUTH_PROVIDER=simple
AUTH_SECRET_KEY=your_secret_key_here

# Database Provider Configuration
DATABASE_PROVIDER=memory

# Storage Provider Configuration
STORAGE_PROVIDER=local
STORAGE_LOCAL_PATH=./data/storage

# Retrieval Provider Configuration
RETRIEVAL_PROVIDER=template

# Generation Provider Configuration
GENERATION_PROVIDER=template
```

## Extending the Backend

### Adding New Providers

To add a new provider implementation:

1. Create a new file in the `providers/` directory for your implementation
2. Update the relevant factory function to include your new provider
3. Update the environment variable to use your new provider

Example for adding a new database provider:

1. Create `providers/mongodb.py` with your MongoDB implementation
2. Update `providers/database.py` to include your new provider:

   ```python
   elif database_provider == "mongodb":
       from providers.mongodb import get_database as get_mongodb
       return get_mongodb(collection_name)
   ```

3. Set `DATABASE_PROVIDER=mongodb` in your `.env` file

### Adding New Routes

To add new API endpoints:

1. Create a new router file in the `routers/` directory or extend an existing one
2. Define your endpoints using FastAPI decorators
3. Add your router to `app.py` using `app.include_router()`

### Integrating with Azure Services

The template is designed to be easily extended to use Azure services:

1. **Authentication**: Azure AD B2C or Microsoft Entra ID
2. **Database**: Azure Cosmos DB
3. **Storage**: Azure Blob Storage
4. **Retrieval**: Azure AI Search
5. **Generation**: Azure OpenAI Service

## API Documentation

When the server is running, you can access the API documentation at:

- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Docker Support

The backend includes Docker support for containerized deployment. The Dockerfile is optimized using uv for fast package installation and caching.

### Building the Docker Image

```bash
# Build the Docker image
docker build -t ai-ground-truth-backend .
```

### Running the Container

```bash
# Run the container in detached mode
docker run -p 8000:8000 --name ai-ground-truth-backend -d ai-ground-truth-backend

# Check if the container is running
docker ps | grep ai-ground-truth-backend

# View container logs
docker logs ai-ground-truth-backend
```

### Managing the Container

```bash
# Stop the container
docker stop ai-ground-truth-backend

# Start an existing container
docker start ai-ground-truth-backend

# Remove the container (must be stopped first)
docker rm ai-ground-truth-backend

# Remove the image
docker rmi ai-ground-truth-backend
```

### Docker Compose

For running the complete application (backend and frontend), use Docker Compose:

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down
```

### Dockerfile Features

The Dockerfile includes the following optimizations:

- Uses uv for faster dependency resolution and installation
- Leverages Docker layer caching for efficient rebuilds
- Compiles Python bytecode for faster startup
- Uses a slim Python image for reduced container size
- Creates a dedicated local storage directory for persistent data

## Testing

While not included in the template, it's recommended to add tests using pytest:

```bash
uv pip install pytest pytest-asyncio httpx
pytest
```

## Contributing

When extending this template for your specific needs, please follow these guidelines:

1. Maintain the provider pattern for extensibility
2. Follow PEP 8 coding standards and use type hints
3. Document new code with docstrings
4. Keep the API RESTful and consistent
