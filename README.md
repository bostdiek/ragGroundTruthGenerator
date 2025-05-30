# AI Ground Truth Generator

A tool for generating ground truth data for AI training.

## Project Structure

- `/frontend`: React application for UI
- `/backend`: Python FastAPI application
- `/infrastructure`: Azure infrastructure configuration

## Development Setup

### Backend

```bash
cd backend
uv venv
uv sync
uv run python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Docker

Run the entire application with Docker Compose:

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up --build -d
```

Or run just the backend:

```bash
# Build the backend image
cd backend
docker build -t ai-ground-truth-backend .

# Run the backend container
docker run -p 8000:8000 --name ai-ground-truth-backend -d ai-ground-truth-backend
```

Access the services:

- Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)
- Frontend (when running docker-compose): [http://localhost:3001](http://localhost:3001)
