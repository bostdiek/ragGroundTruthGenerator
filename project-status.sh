#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}AI Ground Truth Generator - Project Status Check${NC}"
echo "==============================================="

# Check git repository
echo -e "\n${YELLOW}Checking Git Repository...${NC}"
if [ -d .git ]; then
  echo -e "${GREEN}✓ Git repository is initialized${NC}"
else
  echo -e "${RED}✗ Git repository is not initialized${NC}"
  echo "Run 'git init' to create a git repository"
fi

# Check Docker installation
echo -e "\n${YELLOW}Checking Docker...${NC}"
if command -v docker &> /dev/null; then
  echo -e "${GREEN}✓ Docker is installed${NC}"
  docker --version
else
  echo -e "${RED}✗ Docker is not installed${NC}"
  echo "Please install Docker to continue"
  exit 1
fi

# Check Docker Compose installation
echo -e "\n${YELLOW}Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
  echo -e "${GREEN}✓ Docker Compose is installed${NC}"
else
  echo -e "${RED}✗ Docker Compose is not installed${NC}"
  echo "Please install Docker Compose to continue"
  exit 1
fi

# Check if backend container is running
echo -e "\n${YELLOW}Checking Backend Container...${NC}"
if docker ps | grep -q ai-ground-truth-backend; then
  echo -e "${GREEN}✓ Backend container is running${NC}"
  BACKEND_PORT=$(docker port ai-ground-truth-backend | grep 8000 | cut -d ":" -f 2)
  echo "  Backend is available at: http://localhost:${BACKEND_PORT:-8000}"
else
  echo -e "${RED}✗ Backend container is not running${NC}"
  echo "  Run 'docker-compose up -d' or 'docker run -d -p 8000:8000 --name ai-ground-truth-backend ai-ground-truth-backend' to start the backend"
fi

# Check frontend dependencies
echo -e "\n${YELLOW}Checking Frontend Dependencies...${NC}"
if [ -f frontend/node_modules/.package-lock.json ]; then
  echo -e "${GREEN}✓ Frontend dependencies are installed${NC}"
else
  echo -e "${YELLOW}! Frontend dependencies may not be installed${NC}"
  echo "  Run 'cd frontend && npm install' to install dependencies"
fi

echo -e "\n${YELLOW}Running Instructions:${NC}"
echo "1. Start backend: docker-compose up -d"
echo "2. Start frontend: cd frontend && npm start"
echo "3. Access the application at: http://localhost:3000"

echo -e "\n${GREEN}Status check completed!${NC}"
