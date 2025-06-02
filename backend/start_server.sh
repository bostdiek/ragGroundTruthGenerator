#!/bin/bash
# Start the server in the background
uv run uvicorn app:app --host 0.0.0.0 --port 8002 &
# Save the process ID
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
# Sleep to give the server time to start
sleep 5
# Test the server
echo "Testing the server..."
curl -s http://localhost:8002/health
# Return the PID so we can kill it later if needed
echo "To stop the server: kill $SERVER_PID"
