#!/bin/bash

# Script to run eslint on frontend files and fix import ordering and unused imports
cd "$(dirname "$0")"
echo "Running ESLint to fix import ordering and unused imports..."
npx eslint --fix "src/**/*.{js,jsx,ts,tsx}"
echo "ESLint fixes completed!"
