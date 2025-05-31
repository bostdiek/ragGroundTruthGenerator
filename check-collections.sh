#!/bin/bash

echo "Checking collections in the backend..."
echo "Current collection count:"
curl -s -L http://localhost:8000/api/collections | jq '. | length'
echo "Collection names:"
curl -s -L http://localhost:8000/api/collections | jq -r '.[].name'
