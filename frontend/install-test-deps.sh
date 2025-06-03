#!/bin/bash

# This script installs the dependencies required for frontend testing

echo "Installing frontend testing dependencies..."

# Navigate to frontend directory
cd "$(dirname "$0")"

# Install Vitest and related packages
npm install --save-dev vitest @vitest/coverage-v8 @vitest/ui jsdom msw @vitejs/plugin-react

# Display success message
echo "Testing dependencies installed successfully!"
echo "You can now run the tests using:"
echo "  npm run test        # Run tests once"
echo "  npm run test:watch  # Run tests in watch mode"
echo "  npm run test:coverage # Run tests with coverage"
echo "  npm run test:ui     # Run tests with UI"
