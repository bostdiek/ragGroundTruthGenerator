FROM python:3.12-slim-bookworm

# Copy uv from the official image
COPY --from=ghcr.io/astral-sh/uv:0.7.8 /uv /uvx /bin/

# Set environment variables for UV
ENV UV_SYSTEM_PYTHON=1
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Create and set working directory
WORKDIR /app

# Copy only the dependencies files to leverage Docker cache
COPY pyproject.toml .
COPY uv.lock .

# Install dependencies without installing the project itself
# This creates a separate cache layer for dependencies
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-install-project

# Copy the rest of the application
COPY . .

# Install the project
RUN uv sync --locked

# Create local storage directory
RUN mkdir -p /app/data/storage

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uv", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]