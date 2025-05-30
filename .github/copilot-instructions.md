<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Ground Truth Generator Project

This is a full-stack application for generating ground truth data for AI training. The project is designed to template for others to use and extend, with a single simple working example that runs locally via docker.

## Coding Standards

- **TypeScript/JavaScript**: Use TypeScript for type safety. Format with 2-space indentation, single quotes, and semicolons.
- **Python**: Follow PEP 8 guidelines. Use type hints and docstrings for all functions. We are using `uv` as the package manager and `ruff` as the linter. Add packages to the `pyproject.toml` file using `uv add <package>`.
- **React**: Use functional components with hooks. Follow component-based architecture principles.
- **CSS**: Use CSS modules or styled-components for styling.

## Project Structure

- `/frontend`: React application with authentication, collection management, and answer generation.
- `/backend`: Python FastAPI application for data retrieval and answer generation.
- `/infrastructure`: Azure infrastructure configuration using Bicep/ARM templates.
- `/docs`: Project documentation, including architecture diagrams and setup instructions.

## Feature Implementation Guidelines

- Authentication should use Azure AD B2C or a similar service.
- Document retrieval should be extensible to support multiple data sources.
- Answer generation should use Azure OpenAI Service with configurable models.
- All components should be designed with extensibility in mind.
- Follow Azure best practices for deployment and security.

## Dependencies

- Frontend: React, TypeScript, Azure SDK for JavaScript
- Backend: Python, FastAPI, Azure SDK for Python, Azure OpenAI
- Infrastructure: Bicep, Azure CLI

When suggesting code changes or generating new files, ensure they align with these guidelines and the overall architecture of the project.
