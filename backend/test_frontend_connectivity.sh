#!/bin/bash
# Test frontend connectivity to the backend

# Set environment variables
export BACKEND_URL=${BACKEND_URL:-"http://localhost:8000"}

# Function to test an endpoint
test_endpoint() {
  local endpoint=$1
  local method=${2:-"GET"}
  local expected_status=${3:-200}
  local description=$4
  
  echo "Testing $description..."
  
  if [ "$method" == "GET" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -X $method $BACKEND_URL$endpoint)
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Content-Type: application/json" $BACKEND_URL$endpoint)
  fi
  
  if [ "$status" == "$expected_status" ]; then
    echo "✅ $description: Success (Status: $status)"
  else
    echo "❌ $description: Failed (Status: $status, Expected: $expected_status)"
  fi
}

# Function to test an authenticated endpoint
test_auth_endpoint() {
  local endpoint=$1
  local method=${2:-"GET"}
  local expected_status=${3:-200}
  local description=$4
  
  echo "Testing $description with authentication..."
  
  # Login to get a token
  login_response=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{"username":"demo@example.com","password":"password"}' \
    $BACKEND_URL/auth/login)
  
  # Extract the token
  token=$(echo $login_response | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//g')
  
  if [ -z "$token" ]; then
    echo "❌ $description: Failed to get token"
    return
  fi
  
  if [ "$method" == "GET" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Authorization: Bearer $token" $BACKEND_URL$endpoint)
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Content-Type: application/json" -H "Authorization: Bearer $token" $BACKEND_URL$endpoint)
  fi
  
  if [ "$status" == "$expected_status" ]; then
    echo "✅ $description: Success (Status: $status)"
  else
    echo "❌ $description: Failed (Status: $status, Expected: $expected_status)"
  fi
}

# Test public endpoints
echo "=== Testing Public Endpoints ==="
test_endpoint "/docs" "GET" 200 "API Documentation"
test_endpoint "/openapi.json" "GET" 200 "OpenAPI Specification"

# Test authentication
echo ""
echo "=== Testing Authentication ==="
test_endpoint "/auth/login" "POST" 422 "Login Validation"  # 422 because we didn't provide credentials

# Test protected endpoints without authentication
echo ""
echo "=== Testing Protected Endpoints Without Auth ==="
test_endpoint "/collections/" "GET" 401 "Collections List (Unauthorized)"
test_endpoint "/retrieval/templates" "GET" 401 "Templates List (Unauthorized)"
test_endpoint "/generation/answer" "POST" 401 "Generation (Unauthorized)"

# Test protected endpoints with authentication
echo ""
echo "=== Testing Protected Endpoints With Auth ==="
test_auth_endpoint "/collections/" "GET" 200 "Collections List"
test_auth_endpoint "/retrieval/templates" "GET" 200 "Templates List"
test_auth_endpoint "/auth/me" "GET" 200 "Current User"

# Summary
echo ""
echo "=== Frontend Connectivity Test Complete ==="
echo "If all tests passed, the backend is properly configured for frontend connections."
echo "For more details, use the UI or Swagger UI at $BACKEND_URL/docs"
