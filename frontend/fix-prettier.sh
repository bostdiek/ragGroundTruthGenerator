#!/bin/bash

# Script to run prettier on frontend files and fix issues
cd "$(dirname "$0")"
echo "Running Prettier to fix formatting issues in frontend files..."
npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,json}"
echo "Formatting completed!"
