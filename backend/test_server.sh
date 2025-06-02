#!/bin/bash
# Script to run the server and test if it's working

echo "Attempting to start server on port 8003..."
uv run uvicorn app:app --host 0.0.0.0 --port 8003 > server_output.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

echo "Waiting for server to start..."
sleep 5

echo "Testing health endpoint..."
curl -v http://localhost:8003/health

echo "Checking server process..."
ps -p $SERVER_PID || echo "Server process not found"

echo "Server log output:"
cat server_output.log

echo "To stop the server: kill $SERVER_PID"
