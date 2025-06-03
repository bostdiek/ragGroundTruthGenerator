#!/bin/bash

# Script to start the application and open the browser for testing

# Export environment variables for local development
export DEBUG=True
export GENERATION_PROVIDER=demo
export AUTH_PROVIDER=simple
export RETRIEVAL_PROVIDER=template
export ENABLED_DATA_SOURCES=memory
export AUTH_SECRET_KEY=demo_secret_key_for_development

# Print diagnostic information
echo "===== DIAGNOSTIC INFORMATION ====="
echo "Environment Variables:"
echo "  DEBUG=$DEBUG"
echo "  GENERATION_PROVIDER=$GENERATION_PROVIDER"
echo "  AUTH_PROVIDER=$AUTH_PROVIDER"
echo "  RETRIEVAL_PROVIDER=$RETRIEVAL_PROVIDER"
echo "  ENABLED_DATA_SOURCES=$ENABLED_DATA_SOURCES"
echo ""
echo "Login Credentials:"
echo "  Username: demo or demo@example.com"
echo "  Password: password"
echo ""
echo "  Username: admin or admin@example.com"
echo "  Password: admin123"
echo "=================================="

# Stop any running containers
echo "Stopping any running containers..."
docker-compose down

# Start the application
echo "Starting the application with docker-compose..."
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 5

# Open the browser
echo "Opening browser to http://localhost:3000..."
open http://localhost:3000

# Show logs
echo "Showing logs (Ctrl+C to exit)..."
docker-compose logs -f
