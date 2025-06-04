#!/bin/bash

# Script to run prettier on frontend files
cd "$(dirname "$0")"
echo "Running Prettier check on frontend files..."
npx prettier --check "src/**/*.{js,jsx,ts,tsx,css,json}"
