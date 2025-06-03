#!/bin/bash

# Add Playwright and dependencies
npm install --save-dev @playwright/test
npx playwright install

# Create necessary directories if they don't exist
mkdir -p e2e-tests

echo "Playwright E2E testing dependencies installed successfully."
echo "Run 'npm run e2e' to run tests or 'npm run e2e:ui' to run tests with UI."
