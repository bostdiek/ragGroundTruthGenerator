# AI Ground Truth Generator - Local Development Setup

This document provides instructions for setting up and running the AI Ground Truth Generator template in a local development environment using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine
- Git to clone the repository

## Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ise-ai-ground-truth-generator.git
   cd ise-ai-ground-truth-generator
   ```

2. Start the application using Docker Compose:

   ```bash
   docker-compose up
   ```

3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)
   - API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

4. Login using the demo credentials:
   - Username: `demo@example.com`
   - Password: `password`

## Development Tools

### Package Management with uv

This project uses [uv](https://github.com/astral-sh/uv) for fast Python package management. uv is 10-100x faster than pip and provides a complete solution for Python package management.

To install packages manually during development:

```bash
# Inside the backend container
uv pip install <package-name>

# Update requirements.txt with new dependencies
uv pip freeze > requirements.txt
```

### Code Quality with Ruff

This project uses [Ruff](https://github.com/astral-sh/ruff) for fast Python linting and code formatting. Ruff is significantly faster than alternatives like Flake8 and Black.

To run Ruff manually:

```bash
# Inside the backend container
# Check code for issues
ruff check .

# Format code
ruff format .

# Check and fix issues where possible
ruff check --fix .
```

## Development Configuration

### Backend Development Environment

The backend uses simple implementations for development:

- **Authentication**: Simple JWT-based authentication
- **Database**: In-memory database
- **Storage**: Local file system storage
- **Generation**: Template-based text generation
- **Retrieval**: Simple document retrieval

To configure these providers, edit the `.env` file in the `backend` directory.

### Frontend Development Environment

The frontend is configured to work with the simple backend implementations by default.

## Customizing for Production

To customize this template for production:

1. **Authentication**: Implement a production authentication provider
   - See `backend/providers/simple_auth.py` for the template interface
   - Update `frontend/src/services/auth.service.ts` accordingly

2. **Database**: Connect to a production database
   - See `backend/providers/memory_db.py` for the template interface
   - Implement a production database provider

3. **Storage**: Configure cloud storage
   - Implement a storage provider for your preferred cloud storage solution

4. **Generation**: Connect to a production AI service
   - Implement a generation provider for your preferred AI service

5. **Retrieval**: Connect to a production search service
   - Implement a retrieval provider for your preferred search service

## Project Structure

- `/frontend`: React application
- `/backend`: Python FastAPI application
- `/infrastructure`: Azure infrastructure templates
- `/docs`: Project documentation

## Additional Documentation

For more detailed documentation, see the files in the `/docs` directory:

- `architecture.md`: System architecture
- `setup.md`: Detailed setup instructions
- `extending.md`: Guide for extending the template
