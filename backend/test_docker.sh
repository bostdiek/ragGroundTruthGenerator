#!/bin/bash
# Test Docker setup for the backend

# Set environment variables for Docker test
export DATABASE_PROVIDER=memory
export GENERATION_PROVIDER=demo
export RETRIEVAL_PROVIDER=template
export ENABLED_DATA_SOURCES=memory
export AUTH_SECRET_KEY=docker_test_secret_key

# Build the Docker image
echo "Building Docker image..."
docker build -t ai-ground-truth-backend:test .

# Run the Docker container
echo "Running Docker container..."
docker run -d --name ai-ground-truth-backend-test \
  -p 8000:8000 \
  -e DATABASE_PROVIDER=$DATABASE_PROVIDER \
  -e GENERATION_PROVIDER=$GENERATION_PROVIDER \
  -e RETRIEVAL_PROVIDER=$RETRIEVAL_PROVIDER \
  -e ENABLED_DATA_SOURCES=$ENABLED_DATA_SOURCES \
  -e AUTH_SECRET_KEY=$AUTH_SECRET_KEY \
  ai-ground-truth-backend:test

# Wait for the application to start
echo "Waiting for application to start..."
sleep 5

# Test the API
echo "Testing API..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/docs

# Check if the API is running
if [ $? -eq 0 ]; then
  echo "API is running successfully!"
  echo "You can access the API documentation at http://localhost:8000/docs"
else
  echo "API failed to start properly."
  docker logs ai-ground-truth-backend-test
fi

# Cleanup instructions
echo "
To stop and remove the test container, run:
  docker stop ai-ground-truth-backend-test
  docker rm ai-ground-truth-backend-test
"
